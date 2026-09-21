package com.redpen.controller;

import com.redpen.dto.AuthDtos;
import com.redpen.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Password login — STUDENT, STAFF and ADMIN. */
    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** Google ID-token login — PARENT only. Creates the account on first sign-in. */
    @PostMapping("/google")
    public ResponseEntity<AuthDtos.AuthResponse> google(@Valid @RequestBody AuthDtos.GoogleLoginRequest req) {
        return ResponseEntity.ok(authService.loginWithGoogle(req));
    }
}
