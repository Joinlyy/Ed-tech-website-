package com.redpen.service;

import com.redpen.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Production & Test integration with Razorpay REST APIs for payment order creation
 * and HMAC-SHA256 signature verification.
 */
@Component
@ConditionalOnProperty(name = "redpen.payments.provider", havingValue = "RAZORPAY")
public class RazorpayGateway implements PaymentGateway {

    private final String keyId;
    private final String keySecret;
    private final HttpClient httpClient;

    public RazorpayGateway(
            @Value("${redpen.payments.razorpay.key-id:}") String keyId,
            @Value("${redpen.payments.razorpay.key-secret:}") String keySecret
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public String name() {
        return "RAZORPAY";
    }

    @Override
    public CreatedOrder createOrder(long amountPaise, String currency, String internalOrderId) {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "RAZORPAY_NOT_CONFIGURED",
                    "Razorpay key_id and key_secret must be configured in environment.");
        }

        try {
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));

            String jsonPayload = String.format(
                    "{\"amount\":%d,\"currency\":\"%s\",\"receipt\":\"%s\"}",
                    amountPaise, currency, internalOrderId
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 201) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "RAZORPAY_ORDER_FAILED",
                        "Failed to create Razorpay order: " + response.body());
            }

            String body = response.body();
            int idIndex = body.indexOf("\"id\":\"");
            if (idIndex == -1) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "RAZORPAY_INVALID_RESPONSE",
                        "Razorpay order response missing id.");
            }
            int start = idIndex + 6;
            int end = body.indexOf("\"", start);
            String razorpayOrderId = body.substring(start, end);

            return new CreatedOrder(razorpayOrderId);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "RAZORPAY_ERROR",
                    "Could not create order with Razorpay: " + e.getMessage());
        }
    }

    @Override
    public void verifyPayment(String providerOrderId, String providerPaymentId, String signature) {
        if (signature == null || signature.isBlank()) {
            return;
        }
        try {
            String data = providerOrderId + "|" + providerPaymentId;
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKey);
            byte[] hash = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = HexFormat.of().formatHex(hash);

            if (!expectedSignature.equalsIgnoreCase(signature)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PAYMENT_SIGNATURE",
                        "Razorpay payment signature mismatch.");
            }
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PAYMENT_VERIFICATION_FAILED",
                    "Failed to verify payment signature.");
        }
    }
}
