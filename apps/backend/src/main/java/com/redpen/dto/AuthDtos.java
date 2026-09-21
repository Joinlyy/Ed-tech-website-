package com.redpen.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class AuthDtos {

    private AuthDtos() {}

    /**
     * Password login. Used by STUDENT, STAFF and ADMIN.
     * PARENT users authenticate through /api/auth/google and have no password.
     */
    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 128) String password
    ) {}

    /** ID-token exchange from Google Identity Services on the client. */
    public record GoogleLoginRequest(
            @NotBlank String idToken
    ) {}

    public record AuthResponse(
            String token,
            Instant expiresAt,
            UserDto user
    ) {}
}
