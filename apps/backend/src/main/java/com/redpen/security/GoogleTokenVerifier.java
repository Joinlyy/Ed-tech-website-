package com.redpen.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.redpen.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifies a Google-issued ID token against Google's public keys.
 *
 * <p>The frontend (Vite app) uses Google Identity Services to obtain the ID token,
 * then POSTs it to /api/auth/google. We verify locally — no traffic ever leaves
 * our server with a user's Google credentials, and no token is trusted based on
 * shape alone.
 *
 * <p>Fails closed: if the client id isn't configured (blank env var), every
 * verification attempt returns a 501 rather than accepting arbitrary tokens.
 */
@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;
    private final boolean configured;

    public GoogleTokenVerifier(@Value("${redpen.security.google.client-id:}") String clientId) {
        this.configured = clientId != null && !clientId.isBlank();
        if (configured) {
            this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
        } else {
            this.verifier = null;
        }
    }

    /** Returned to callers so services can create/update users without re-parsing the token. */
    public record VerifiedGoogleUser(String sub, String email, String name, boolean emailVerified) {}

    public VerifiedGoogleUser verify(String idToken) {
        if (!configured) {
            throw new ApiException(HttpStatus.NOT_IMPLEMENTED, "GOOGLE_NOT_CONFIGURED",
                    "Google sign-in is not configured on this server (REDPEN_GOOGLE_CLIENT_ID is unset).");
        }
        if (idToken == null || idToken.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "GOOGLE_TOKEN_MISSING", "ID token is required.");
        }
        try {
            GoogleIdToken parsed = verifier.verify(idToken);
            if (parsed == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "GOOGLE_TOKEN_INVALID",
                        "Google rejected the ID token (bad signature, wrong audience, or expired).");
            }
            GoogleIdToken.Payload p = parsed.getPayload();
            Boolean emailVerified = p.getEmailVerified();
            return new VerifiedGoogleUser(
                    p.getSubject(),
                    p.getEmail(),
                    (String) p.get("name"),
                    Boolean.TRUE.equals(emailVerified)
            );
        } catch (ApiException e) {
            throw e; // preserve our own 401
        } catch (Exception e) {
            // Catch-all for GeneralSecurityException, IOException, IllegalArgumentException
            // (malformed base64) and anything else the parser can throw. Never leak the
            // underlying reason to the caller — it can confirm token structure.
            throw new ApiException(HttpStatus.UNAUTHORIZED, "GOOGLE_TOKEN_INVALID",
                    "Could not verify the Google ID token.");
        }
    }
}
