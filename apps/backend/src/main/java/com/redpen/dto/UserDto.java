package com.redpen.dto;

import com.redpen.entity.User;
import com.redpen.entity.UserRole;

import java.time.Instant;

public record UserDto(
        String id,
        String email,
        String fullName,
        UserRole role,
        String familyId,
        Instant createdAt
) {
    public static UserDto from(User u) {
        return new UserDto(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getRole(),
                u.getFamilyId(),
                u.getCreatedAt()
        );
    }
}
