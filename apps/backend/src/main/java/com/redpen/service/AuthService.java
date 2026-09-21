package com.redpen.service;

import com.redpen.dto.AuthDtos;
import com.redpen.dto.UserDto;
import com.redpen.entity.User;
import com.redpen.entity.UserRole;
import com.redpen.exception.ApiException;
import com.redpen.repository.UserRepository;
import com.redpen.security.GoogleTokenVerifier;
import com.redpen.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Two authentication paths:
 * <ol>
 *   <li>Google ID token → PARENT users. Creates the user on first sign-in.</li>
 *   <li>Email + password → STUDENT / STAFF / ADMIN users. Never used by PARENTS.</li>
 * </ol>
 * All returns an app-issued JWT — the Google token is only used for identity, not authorisation.
 */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final GoogleTokenVerifier google;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt, GoogleTokenVerifier google) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.google = google;
    }

    /** Email + password login. Used by STUDENT, STAFF and ADMIN. Rejects PARENT accounts (they have no password). */
    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        String cleanEmail = req.email() != null ? req.email().trim() : "";
        User user = users.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(this::invalidCreds);
        if (user.getPasswordHash() == null) {
            // PARENT accounts must go through /api/auth/google — refuse silently as bad creds
            // rather than reveal that this email belongs to a Google-only account.
            throw invalidCreds();
        }
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw invalidCreds();
        }
        return toResponse(user);
    }

    /** Google ID token login. Creates a PARENT user on first sign-in, returns an app JWT. */
    @Transactional
    public AuthDtos.AuthResponse loginWithGoogle(AuthDtos.GoogleLoginRequest req) {
        GoogleTokenVerifier.VerifiedGoogleUser g = google.verify(req.idToken());
        if (!g.emailVerified()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "GOOGLE_EMAIL_UNVERIFIED",
                    "Your Google account has not verified this email.");
        }

        // 1. Match by stable Google sub. Rotate email if the user has changed it in Google.
        var bySub = users.findByGoogleSub(g.sub());
        if (bySub.isPresent()) {
            User existing = bySub.get();
            if (!existing.getEmail().equalsIgnoreCase(g.email())) {
                existing.setEmail(g.email());
            }
            return toResponse(existing);
        }

        // 2. Fallback: an existing PARENT (or legacy CLIENT) account with the same email
        //    predates the Google sub-column — attach the sub and let them in. We *refuse*
        //    to attach a sub to STUDENT/STAFF/ADMIN — those must never be silently upgraded
        //    to Google-auth, otherwise a matching Gmail could hijack a role.
        var byEmail = users.findByEmail(g.email());
        if (byEmail.isPresent()) {
            User existing = byEmail.get();
            if (existing.getRole() == UserRole.PARENT || existing.getRole() == UserRole.CLIENT) {
                if (existing.getGoogleSub() == null) existing.setGoogleSub(g.sub());
                return toResponse(existing);
            }
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ROLE_CONFLICT",
                    "This email is already used by a non-parent account. Sign in with the correct method.");
        }

        // 3. Create a fresh PARENT.
        User created = users.save(User.builder()
                .email(g.email())
                .fullName(g.name() == null ? g.email() : g.name())
                .role(UserRole.PARENT)
                .googleSub(g.sub())
                .build());
        return toResponse(created);
    }

    private AuthDtos.AuthResponse toResponse(User user) {
        JwtService.IssuedToken t = jwt.issue(user);
        return new AuthDtos.AuthResponse(t.token(), t.expiresAt(), UserDto.from(user));
    }

    private ApiException invalidCreds() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password.");
    }
}
