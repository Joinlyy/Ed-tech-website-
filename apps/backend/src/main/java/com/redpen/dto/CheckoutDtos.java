package com.redpen.dto;

import com.redpen.entity.OrderStatus;
import com.redpen.entity.PaymentOrder;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public final class CheckoutDtos {

    private CheckoutDtos() {}

    /** Parent posts this to start a checkout. Auth: PARENT. */
    public record CheckoutRequest(
            @NotBlank String planCode,
            String couponCode
    ) {}

    /** What we return so the frontend can open the Razorpay SDK sheet. */
    public record CheckoutResponse(
            String orderId,
            String planCode,
            long amountPaise,
            long originalAmountPaise,
            long discountAmountPaise,
            long mrpPaise,
            String currency,
            String provider,
            String providerOrderId,
            String razorpayKeyId,
            OrderStatus status
    ) {
        public static CheckoutResponse from(PaymentOrder o, long originalAmountPaise, long discountAmountPaise, long mrpPaise, String razorpayKeyId) {
            return new CheckoutResponse(
                    o.getId(),
                    o.getPlanCode(),
                    o.getAmountPaise(),
                    originalAmountPaise,
                    discountAmountPaise,
                    mrpPaise,
                    o.getCurrency(),
                    o.getProvider(),
                    o.getProviderOrderId(),
                    razorpayKeyId,
                    o.getStatus()
            );
        }
    }

    /** Request to validate a coupon code before initiating payment. */
    public record ValidateCouponRequest(
            @NotBlank String couponCode,
            @NotBlank String planCode
    ) {}

    /** Result of validating a coupon code. */
    public record CouponValidationResponse(
            boolean valid,
            String couponCode,
            int discountPercent,
            long originalAmountPaise,
            long discountAmountPaise,
            long finalAmountPaise,
            String message
    ) {}

    /** Dev/client payment confirmation request. */
    public record ConfirmRequest(
            @NotBlank String providerPaymentId,
            String signature
    ) {}

    public record OrderView(
            String id,
            String planCode,
            long amountPaise,
            String currency,
            OrderStatus status,
            String familyId,
            Instant createdAt,
            Instant paidAt
    ) {
        public static OrderView from(PaymentOrder o) {
            return new OrderView(
                    o.getId(),
                    o.getPlanCode(),
                    o.getAmountPaise(),
                    o.getCurrency(),
                    o.getStatus(),
                    o.getFamilyId(),
                    o.getCreatedAt(),
                    o.getPaidAt()
            );
        }
    }
}
