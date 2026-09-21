package com.redpen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "papers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paper {

    @Id
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @Column(name = "student_id", nullable = false, length = 36)
    private String studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "board_class", nullable = false, length = 20)
    private BoardClass boardClass;

    @Column(nullable = false, length = 40)
    private String subject;

    @Column(name = "paper_number", nullable = false)
    private int paperNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaperStatus status;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @Column(name = "marked_at")
    private Instant markedAt;

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "awarded_marks")
    private Integer awardedMarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = PaperStatus.DRAFT;
    }
}
