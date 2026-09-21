package com.redpen.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class FamilyDtos {

    private FamilyDtos() {}

    /**
     * Parent creates a student login. Called from the post-payment page or Settings.
     */
    public record AddStudentRequest(
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 128) String password
    ) {}

    public record FamilyView(
            String id,
            String planCode,
            String planName,
            int paperQuota,
            int maxStudents,
            boolean active,
            String paidAt,
            String validUntil,
            UserDto parent,
            List<UserDto> students
    ) {}
}
