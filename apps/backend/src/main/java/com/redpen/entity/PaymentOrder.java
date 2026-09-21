package com.redpen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * One checkout attempt. Created in PENDING state when the parent picks a plan,
 * transitioned to PAID by the payment gateway's webhook (or, in dev, by the
 * manual confirm endpoint). All amounts are stored as integer paise to avoid
 * floating-point currency bugs.
 */
@Entity
@Table(name = "payment_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrder {

    @Id
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @Column(name = "parent_user_id", nullable = false, length = 36)
    private String parentUserId;

    /** Populated when the order settles and a family is created / found. */
    @Column(name = "family_id", length = 36)
    private String familyId;

    @Column(name = "plan_code", nullable = false, length = 40)
    private String planCode;

    /** Money is always stored in the smallest currency unit. INR → paise. */
    @Column(name = "amount_paise", nullable = false)
    private long amountPaise;

    @Column(nullable = false, length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    /** e.g. "STUB", "RAZORPAY", "STRIPE". */
    @Column(nullable = false, length = 20)
    private String provider;

    @Column(name = "provider_order_id", length = 128)
    private String providerOrderId;

    @Column(name = "provider_payment_id", length = 128)
    private String providerPaymentId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = OrderStatus.PENDING;
        if (currency == null) currency = "INR";
        if (provider == null) provider = "STUB";
    }
}
