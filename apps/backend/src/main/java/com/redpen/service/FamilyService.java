package com.redpen.service;

import com.redpen.dto.FamilyDtos;
import com.redpen.dto.PlanCatalog;
import com.redpen.dto.UserDto;
import com.redpen.entity.Family;
import com.redpen.entity.User;
import com.redpen.entity.UserRole;
import com.redpen.exception.ApiException;
import com.redpen.repository.FamilyRepository;
import com.redpen.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class FamilyService {

    private final UserRepository users;
    private final FamilyRepository families;
    private final PasswordEncoder encoder;

    public FamilyService(UserRepository users, FamilyRepository families, PasswordEncoder encoder) {
        this.users = users;
        this.families = families;
        this.encoder = encoder;
    }

    @Transactional
    public UserDto addStudent(String parentUserId, FamilyDtos.AddStudentRequest req) {
        User parent = users.findById(parentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "PARENT_NOT_FOUND", "Parent account missing."));
        if (parent.getRole() != UserRole.PARENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_A_PARENT", "Only parents can add students.");
        }

        Family family = families.findByParentUserId(parentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.PAYMENT_REQUIRED, "NO_FAMILY",
                        "Complete a payment before adding a student."));

        PlanCatalog.Plan plan = PlanCatalog.byCode(family.getPlanCode()).orElse(null);
        int maxStudents = plan != null ? plan.maxStudents() : 1;
        List<User> existingStudents = users.findByFamilyIdAndRole(family.getId(), UserRole.STUDENT);

        if (existingStudents.size() >= maxStudents) {
            String planName = plan != null ? plan.name() : family.getPlanCode();
            throw new ApiException(HttpStatus.FORBIDDEN, "MAX_STUDENTS_REACHED",
                    "Your current plan (" + planName + ") allows a maximum of " + maxStudents + " student account(s). Upgrade your plan to add more student accounts.");
        }

        if (users.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_TAKEN",
                    "That email is already in use. Pick another for your student.");
        }

        User student = User.builder()
                .email(req.email())
                .fullName(req.fullName())
                .passwordHash(encoder.encode(req.password()))
                .role(UserRole.STUDENT)
                .familyId(family.getId())
                .build();
        users.save(student);
        return UserDto.from(student);
    }

    @Transactional(readOnly = true)
    public FamilyDtos.FamilyView viewOwnFamily(String parentUserId) {
        User parent = users.findById(parentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "PARENT_NOT_FOUND", "Parent account missing."));
        if (parent.getRole() != UserRole.PARENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_A_PARENT", "Only parents can view families.");
        }
        Family family = families.findByParentUserId(parentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NO_FAMILY", "No family yet — pay first."));
        List<UserDto> students = users.findByFamilyIdAndRole(family.getId(), UserRole.STUDENT).stream()
                .map(UserDto::from)
                .toList();

        PlanCatalog.Plan plan = PlanCatalog.byCode(family.getPlanCode()).orElse(null);
        String planName = plan != null ? plan.name() : family.getPlanCode();
        int paperQuota = plan != null ? plan.paperCount() : 5;
        int maxStudents = plan != null ? plan.maxStudents() : 1;
        boolean active = family.getValidUntil() != null && family.getValidUntil().isAfter(Instant.now());

        return new FamilyDtos.FamilyView(
                family.getId(),
                family.getPlanCode(),
                planName,
                paperQuota,
                maxStudents,
                active,
                Objects.toString(family.getPaidAt(), null),
                Objects.toString(family.getValidUntil(), null),
                UserDto.from(parent),
                students
        );
    }
}
