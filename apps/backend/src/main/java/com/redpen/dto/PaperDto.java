package com.redpen.dto;

import com.redpen.entity.BoardClass;
import com.redpen.entity.Paper;
import com.redpen.entity.PaperStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record PaperDto(
        String id,
        String studentId,
        BoardClass boardClass,
        String subject,
        int paperNumber,
        PaperStatus status,
        Instant uploadedAt,
        Instant markedAt,
        Integer totalMarks,
        Integer awardedMarks
) {
    public static PaperDto from(Paper p) {
        return new PaperDto(
                p.getId(),
                p.getStudentId(),
                p.getBoardClass(),
                p.getSubject(),
                p.getPaperNumber(),
                p.getStatus(),
                p.getUploadedAt(),
                p.getMarkedAt(),
                p.getTotalMarks(),
                p.getAwardedMarks()
        );
    }

    public record CreateRequest(
            @NotNull BoardClass boardClass,
            @NotBlank String subject,
            @Min(1) int paperNumber
    ) {}
}
