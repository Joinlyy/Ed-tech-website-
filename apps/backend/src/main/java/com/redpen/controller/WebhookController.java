package com.redpen.controller;

import com.redpen.service.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * Handles incoming Razorpay Webhooks (e.g. order.paid, payment.captured).
 */
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final OrderService orderService;
    private final String webhookSecret;

    public WebhookController(
            OrderService orderService,
            @Value("${redpen.payments.razorpay.webhook-secret:}") String webhookSecret
    ) {
        this.orderService = orderService;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody String rawPayload
    ) {
        if (webhookSecret != null && !webhookSecret.isBlank() && signature != null && !signature.isBlank()) {
            if (!verifyWebhookSignature(rawPayload, signature, webhookSecret)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid webhook signature");
            }
        }

        try {
            // Simple string extraction of order_id and payment_id from JSON payload
            String orderId = extractJsonValue(rawPayload, "order_id");
            String paymentId = extractJsonValue(rawPayload, "id");

            if (orderId != null && paymentId != null) {
                orderService.confirmPaymentByProviderOrderId(orderId, paymentId, signature);
            }
            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            // Webhooks expect 200/202 to acknowledge receipt
            return ResponseEntity.ok("Webhook received with note: " + e.getMessage());
        }
    }

    private boolean verifyWebhookSignature(String payload, String expectedSignature, String secret) {
        try {
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKey);
            byte[] hash = sha256HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equalsIgnoreCase(expectedSignature);
        } catch (Exception e) {
            return false;
        }
    }

    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":\"";
        int idx = json.indexOf(searchKey);
        if (idx == -1) return null;
        int start = idx + searchKey.length();
        int end = json.indexOf("\"", start);
        if (end == -1) return null;
        return json.substring(start, end);
    }
}
