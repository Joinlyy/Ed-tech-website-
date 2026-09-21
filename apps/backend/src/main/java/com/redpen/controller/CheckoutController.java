package com.redpen.controller;

import com.redpen.dto.CheckoutDtos;
import com.redpen.dto.PlanCatalog;
import com.redpen.entity.PaymentOrder;
import com.redpen.exception.ApiException;
import com.redpen.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final OrderService orderService;

    public CheckoutController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Public — anyone (including anonymous browsers) can list plans. */
    @GetMapping("/plans")
    public List<PlanCatalog.Plan> plans() {
        return PlanCatalog.all();
    }

    /** Public — validate a coupon code before initiating checkout. */
    @PostMapping("/validate-coupon")
    public ResponseEntity<CheckoutDtos.CouponValidationResponse> validateCoupon(
            @Valid @RequestBody CheckoutDtos.ValidateCouponRequest req
    ) {
        return ResponseEntity.ok(orderService.validateCoupon(req.couponCode(), req.planCode()));
    }

    /** Parent picks a plan and gets back a provider order id to hand to the payment SDK. */
    @PostMapping
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<CheckoutDtos.CheckoutResponse> create(
            Authentication auth,
            @Valid @RequestBody CheckoutDtos.CheckoutRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createCheckout(currentParentId(auth), req));
    }

    /**
     * Confirm a payment against an existing order. Called from client callback after
     * Razorpay sheet completion. Idempotent.
     */
    @PostMapping("/{orderId}/confirm")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<CheckoutDtos.OrderView> confirm(
            Authentication auth,
            @PathVariable String orderId,
            @Valid @RequestBody CheckoutDtos.ConfirmRequest req
    ) {
        PaymentOrder confirmed = orderService.confirmPayment(currentParentId(auth), orderId, req.providerPaymentId(), req.signature());
        return ResponseEntity.ok(CheckoutDtos.OrderView.from(confirmed));
    }

    private String currentParentId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Not signed in.");
        }
        return auth.getName();
    }
}
