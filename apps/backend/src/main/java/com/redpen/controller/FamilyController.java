package com.redpen.controller;

import com.redpen.dto.FamilyDtos;
import com.redpen.dto.UserDto;
import com.redpen.exception.ApiException;
import com.redpen.service.FamilyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    /** Post-payment page — parent creates their student login. */
    @PostMapping("/students")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<UserDto> addStudent(Authentication auth, @Valid @RequestBody FamilyDtos.AddStudentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(familyService.addStudent(currentUserId(auth), req));
    }

    /** Parent-only view of their family + students. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PARENT')")
    public FamilyDtos.FamilyView me(Authentication auth) {
        return familyService.viewOwnFamily(currentUserId(auth));
    }

    private String currentUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Not signed in.");
        }
        return auth.getName();
    }
}
