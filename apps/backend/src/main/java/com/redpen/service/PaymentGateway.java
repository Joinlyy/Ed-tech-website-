package com.redpen.service;

/**
 * The one interface between our checkout logic and any payment provider.
 * Add a new provider by implementing this — no other code changes.
 */
public interface PaymentGateway {

    /** Provider name recorded on the PaymentOrder. e.g. "STUB", "RAZORPAY". */
    String name();

    /** Ask the provider to create an order for this amount. Returns the provider's order id. */
    CreatedOrder createOrder(long amountPaise, String currency, String internalOrderId);

    /** Verify a payment (signature + fetch status). Throws if the payment isn't legitimately paid. */
    void verifyPayment(String providerOrderId, String providerPaymentId, String signature);

    record CreatedOrder(String providerOrderId) {}
}
