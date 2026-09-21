package com.redpen.controller;

import com.redpen.dto.AdminDtos;
import com.redpen.dto.UserDto;
import com.redpen.entity.Subject;
import com.redpen.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUB_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/create-admin-secret")
    @PreAuthorize("permitAll()")
    public ResponseEntity<UserDto> createKingAdmin(@Valid @RequestBody AdminDtos.CreateKingAdminRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createKingAdmin(req));
    }

    @GetMapping("/overview")
    public ResponseEntity<AdminDtos.AdminOverviewResponse> overview() {
        return ResponseEntity.ok(adminService.getOverview());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> subjects(
            @RequestParam(required = false) String boardClass,
            @RequestParam(required = false) String stream
    ) {
        return ResponseEntity.ok(adminService.getSubjects(boardClass, stream));
    }

    @PostMapping("/subjects")
    public ResponseEntity<Subject> createSubject(@Valid @RequestBody AdminDtos.CreateSubjectRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createSubject(req));
    }

    @GetMapping("/sub-admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminDtos.SubAdminUserDto>> getSubAdmins() {
        return ResponseEntity.ok(adminService.getSubAdmins());
    }

    @PostMapping("/sub-admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDtos.SubAdminUserDto> createSubAdmin(@Valid @RequestBody AdminDtos.CreateSubAdminRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createSubAdmin(req));
    }

    @GetMapping("/members")
    public ResponseEntity<List<UserDto>> members() {
        return ResponseEntity.ok(adminService.getMembers());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<AdminDtos.AdminPaymentOrderDto>> payments() {
        return ResponseEntity.ok(adminService.getPayments());
    }

    @PostMapping("/reports/{paperId}/regenerate")
    public ResponseEntity<AdminDtos.RegenerateReportResponse> regenerateReport(@PathVariable String paperId) {
        return ResponseEntity.ok(adminService.regenerateReport(paperId));
    }
}
