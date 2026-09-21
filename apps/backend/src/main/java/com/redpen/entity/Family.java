package com.redpen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * One paying household. Owns the plan and links the parent to their students.
 * Created only after a successful payment; a Google-signed-up parent has no
 * family until their first checkout completes.
 */
@Entity
@Table(name = "families")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Family {

    @Id
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    /** The paying parent. One family per parent. */
    @Column(name = "parent_user_id", nullable = false, length = 36, unique = true)
    private String parentUserId;

    @Column(name = "plan_code", nullable = false, length = 40)
    private String planCode;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "valid_until")
    private Instant validUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
    }
}
