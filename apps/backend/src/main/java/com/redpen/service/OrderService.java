package com.redpen.service;

import com.redpen.dto.CheckoutDtos;
import com.redpen.dto.PlanCatalog;
import com.redpen.entity.Family;
import com.redpen.entity.OrderStatus;
import com.redpen.entity.PaymentOrder;
import com.redpen.exception.ApiException;
import com.redpen.repository.FamilyRepository;
import com.redpen.repository.PaymentOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class OrderService {

    private final PaymentOrderRepository orders;
    private final FamilyRepository families;
    private final PaymentGateway gateway;
    private final String razorpayKeyId;

    public OrderService(
            PaymentOrderRepository orders,
            FamilyRepository families,
            PaymentGateway gateway,
            @Value("${redpen.payments.razorpay.key-id:}") String razorpayKeyId
    ) {
        this.orders = orders;
        this.families = families;
        this.gateway = gateway;
        this.razorpayKeyId = razorpayKeyId;
    }

    /** Validate a coupon code against a plan. */
    public CheckoutDtos.CouponValidationResponse validateCoupon(String couponCode, String planCode) {
        PlanCatalog.Plan plan = PlanCatalog.byCode(planCode)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "UNKNOWN_PLAN",
                        "No plan with code '" + planCode + "'."));

        if (couponCode == null || couponCode.trim().isEmpty()) {
            return new CheckoutDtos.CouponValidationResponse(
                    false, "", 0, plan.amountPaise(), 0, plan.amountPaise(), "No coupon applied"
            );
        }

        String code = couponCode.trim().toUpperCase();
        int discountPercent = 0;
        if ("WISH10".equals(code)) {
            discountPercent = 10;
        } else if ("WISH15".equals(code)) {
            discountPercent = 15;
        } else {
            return new CheckoutDtos.CouponValidationResponse(
                    false, code, 0, plan.amountPaise(), 0, plan.amountPaise(), "Invalid coupon code. Use WISH10 or WISH15."
            );
        }

        long originalAmountPaise = plan.amountPaise();
        long discountAmountPaise = (originalAmountPaise * discountPercent) / 100;
        long finalAmountPaise = originalAmountPaise - discountAmountPaise;

        return new CheckoutDtos.CouponValidationResponse(
                true, code, discountPercent, originalAmountPaise, discountAmountPaise, finalAmountPaise,
                discountPercent + "% discount applied successfully!"
        );
    }

    /** Parent picks a plan. Supports prorated plan upgrades if an existing active family plan exists. */
    @Transactional
    public CheckoutDtos.CheckoutResponse createCheckout(String parentUserId, CheckoutDtos.CheckoutRequest req) {
        PlanCatalog.Plan targetPlan = PlanCatalog.byCode(req.planCode())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "UNKNOWN_PLAN",
                        "No plan with code '" + req.planCode() + "'."));

        Optional<Family> existingFamily = families.findByParentUserId(parentUserId);
        long upgradeCreditPaise = 0;
        
        if (existingFamily.isPresent()) {
            PlanCatalog.Plan currentPlan = PlanCatalog.byCode(existingFamily.get().getPlanCode()).orElse(null);
            if (currentPlan != null && targetPlan.amountPaise() > currentPlan.amountPaise()) {
                upgradeCreditPaise = currentPlan.amountPaise();
            }
        }

        long baseProratedPaise = Math.max(0, targetPlan.amountPaise() - upgradeCreditPaise);

        CheckoutDtos.CouponValidationResponse couponRes = validateCoupon(req.couponCode(), targetPlan.code());
        long couponDiscountPaise = couponRes.discountAmountPaise();
        long finalAmountPaise = Math.max(0, baseProratedPaise - couponDiscountPaise);

        PaymentOrder order = PaymentOrder.builder()
                .parentUserId(parentUserId)
                .planCode(targetPlan.code())
                .amountPaise(finalAmountPaise)
                .currency("INR")
                .provider(gateway.name())
                .status(OrderStatus.PENDING)
                .build();
        orders.save(order);

        PaymentGateway.CreatedOrder created = gateway.createOrder(order.getAmountPaise(), order.getCurrency(), order.getId());
        order.setProviderOrderId(created.providerOrderId());
        orders.save(order);

        return CheckoutDtos.CheckoutResponse.from(
                order,
                targetPlan.amountPaise(),
                couponDiscountPaise + upgradeCreditPaise,
                targetPlan.mrpPaise(),
                razorpayKeyId
        );
    }

    /** Confirm a payment by internal order ID. */
    @Transactional
    public PaymentOrder confirmPayment(String parentUserId, String orderId, String providerPaymentId, String signature) {
        PaymentOrder order = orders.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND", "Order not found."));

        if (!order.getParentUserId().equals(parentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ORDER_FORBIDDEN", "This order does not belong to you.");
        }

        return processPaymentConfirmation(order, providerPaymentId, signature);
    }

    /** Confirm a payment by Razorpay provider order ID (used by Webhooks). */
    @Transactional
    public PaymentOrder confirmPaymentByProviderOrderId(String providerOrderId, String providerPaymentId, String signature) {
        PaymentOrder order = orders.findAll().stream()
                .filter(o -> providerOrderId.equals(o.getProviderOrderId()))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND",
                        "Order with providerOrderId " + providerOrderId + " not found."));

        return processPaymentConfirmation(order, providerPaymentId, signature);
    }

    private PaymentOrder processPaymentConfirmation(PaymentOrder order, String providerPaymentId, String signature) {
        if (order.getStatus() == OrderStatus.PAID) {
            return order; // idempotent
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "ORDER_NOT_PENDING",
                    "Order is not payable — current status is " + order.getStatus() + ".");
        }

        // Verify HMAC signature with provider
        gateway.verifyPayment(order.getProviderOrderId(), providerPaymentId, signature);

        PlanCatalog.Plan plan = PlanCatalog.byCode(order.getPlanCode())
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "PLAN_MISSING",
                        "Plan disappeared between checkout and confirm."));

        // Create or update family record
        Family family = families.findByParentUserId(order.getParentUserId())
                .orElseGet(() -> families.save(Family.builder()
                        .parentUserId(order.getParentUserId())
                        .planCode(plan.code())
                        .paidAt(Instant.now())
                        .validUntil(Instant.now().plus(plan.validityDays(), ChronoUnit.DAYS))
                        .build()));

        family.setPlanCode(plan.code());
        family.setPaidAt(Instant.now());
        family.setValidUntil(Instant.now().plus(plan.validityDays(), ChronoUnit.DAYS));

        order.setStatus(OrderStatus.PAID);
        order.setProviderPaymentId(providerPaymentId);
        order.setPaidAt(Instant.now());
        order.setFamilyId(family.getId());
        return order;
    }
}
