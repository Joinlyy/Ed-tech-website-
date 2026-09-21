package com.redpen.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Dev-only gateway that instantly "creates" and "verifies" an order.
 * Selected when redpen.payments.provider = STUB (the default).
 *
 * <p>Never behaves like real money — every verifyPayment succeeds. Replace with
 * a RazorpayGateway / StripeGateway before opening billing to real users.
 */
@Component
@ConditionalOnProperty(name = "redpen.payments.provider", havingValue = "STUB", matchIfMissing = true)
public class StubPaymentGateway implements PaymentGateway {

    @Override
    public String name() {
        return "STUB";
    }

    @Override
    public CreatedOrder createOrder(long amountPaise, String currency, String internalOrderId) {
        return new CreatedOrder("stub_ord_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
    }

    @Override
    public void verifyPayment(String providerOrderId, String providerPaymentId, String signature) {
        // No-op — dev only. A real gateway verifies HMAC signatures here.
    }
}
