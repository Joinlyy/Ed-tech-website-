package com.redpen.dto;

import com.redpen.entity.AdminPermission;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public final class AdminDtos {

    private AdminDtos() {}

    public record AdminOverviewResponse(
            long totalRevenuePaise,
            long activeFamiliesCount,
            long totalStudentsCount,
            long pendingEvaluationsCount,
            long completedReportsCount,
            long totalSubAdminsCount
    ) {}

    public record CreateSubjectRequest(
            @NotBlank String name,
            @NotBlank String code,
            @NotBlank String boardClass,
            @NotBlank String stream
    ) {}

    public record CreateSubAdminRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            @NotBlank String password,
            Set<AdminPermission> permissions
    ) {}

    public record SubAdminUserDto(
            String id,
            String email,
            String fullName,
            Set<AdminPermission> permissions,
            Instant createdAt
    ) {}

    public record AdminPaymentOrderDto(
            String id,
            String parentEmail,
            String parentName,
            String planCode,
            long amountPaise,
            String status,
            String provider,
            String providerOrderId,
            String providerPaymentId,
            Instant createdAt
    ) {}

    public record CreateKingAdminRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String secretKey
    ) {}

    public record RegenerateReportResponse(
            boolean success,
            String paperId,
            String message,
            Instant regeneratedAt
    ) {}
}
