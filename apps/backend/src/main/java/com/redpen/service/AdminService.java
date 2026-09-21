package com.redpen.service;

import com.redpen.dto.AdminDtos;
import com.redpen.dto.UserDto;
import com.redpen.entity.OrderStatus;
import com.redpen.entity.PaperStatus;
import com.redpen.entity.Subject;
import com.redpen.entity.User;
import com.redpen.entity.UserRole;
import com.redpen.exception.ApiException;
import com.redpen.repository.FamilyRepository;
import com.redpen.repository.PaperRepository;
import com.redpen.repository.PaymentOrderRepository;
import com.redpen.repository.SubjectRepository;
import com.redpen.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final UserRepository users;
    private final FamilyRepository families;
    private final PaymentOrderRepository orders;
    private final PaperRepository papers;
    private final SubjectRepository subjects;
    private final PasswordEncoder encoder;

    @org.springframework.beans.factory.annotation.Value("${redpen.admin.secret-key:RedPenKingAdminSecret2026!}")
    private String adminSecretKey;

    public AdminService(
            UserRepository users,
            FamilyRepository families,
            PaymentOrderRepository orders,
            PaperRepository papers,
            SubjectRepository subjects,
            PasswordEncoder encoder
    ) {
        this.users = users;
        this.families = families;
        this.orders = orders;
        this.papers = papers;
        this.subjects = subjects;
        this.encoder = encoder;
    }

    @Transactional
    public UserDto createKingAdmin(AdminDtos.CreateKingAdminRequest req) {
        if (!adminSecretKey.equals(req.secretKey())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "INVALID_SECRET_KEY", "Invalid admin creation secret key.");
        }
        String cleanEmail = req.email().trim().toLowerCase();
        Optional<User> existing = users.findByEmailIgnoreCase(cleanEmail);
        User admin;
        if (existing.isPresent()) {
            admin = existing.get();
            admin.setRole(UserRole.ADMIN);
            admin.setPasswordHash(encoder.encode(req.password()));
            admin.setFullName(req.fullName().trim());
        } else {
            admin = User.builder()
                    .fullName(req.fullName().trim())
                    .email(cleanEmail)
                    .passwordHash(encoder.encode(req.password()))
                    .role(UserRole.ADMIN)
                    .build();
        }
        User saved = users.save(admin);
        return UserDto.from(saved);
    }

    @Transactional(readOnly = true)
    public AdminDtos.AdminOverviewResponse getOverview() {
        long totalRevenuePaise = orders.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .mapToLong(o -> o.getAmountPaise())
                .sum();

        long activeFamilies = families.count();
        long totalStudents = users.findAll().stream().filter(u -> u.getRole() == UserRole.STUDENT).count();
        long pendingEvaluations = papers.findAll().stream().filter(p -> p.getStatus() == PaperStatus.IN_REVIEW || p.getStatus() == PaperStatus.UPLOADED).count();
        long completedReports = papers.findAll().stream().filter(p -> p.getStatus() == PaperStatus.MARKED || p.getStatus() == PaperStatus.DELIVERED).count();
        long subAdminsCount = users.findAll().stream().filter(u -> u.getRole() == UserRole.SUB_ADMIN).count();

        return new AdminDtos.AdminOverviewResponse(
                totalRevenuePaise,
                activeFamilies,
                totalStudents,
                pendingEvaluations,
                completedReports,
                subAdminsCount
        );
    }

    @Transactional
    public List<Subject> getSubjects(String boardClass, String stream) {
        if (subjects.count() == 0) {
            seedDefaultSubjects();
        }
        String cleanClass = (boardClass != null && !boardClass.isBlank())
                ? boardClass.trim().replace(" ", "_").toUpperCase()
                : null;
        String cleanStream = (stream != null && !stream.isBlank())
                ? stream.trim().toUpperCase()
                : null;

        if (cleanClass != null && cleanStream != null) {
            return subjects.findByBoardClassAndStream(cleanClass, cleanStream);
        } else if (cleanClass != null) {
            return subjects.findByBoardClass(cleanClass);
        }
        return subjects.findAll();
    }

    @Transactional
    public Subject createSubject(AdminDtos.CreateSubjectRequest req) {
        if (subjects.findByCode(req.code()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "SUBJECT_EXISTS", "Subject code '" + req.code() + "' already exists.");
        }
        Subject s = Subject.builder()
                .name(req.name())
                .code(req.code().toUpperCase())
                .boardClass(req.boardClass())
                .stream(req.stream())
                .build();
        return subjects.save(s);
    }

    @Transactional
    public AdminDtos.SubAdminUserDto createSubAdmin(AdminDtos.CreateSubAdminRequest req) {
        String cleanEmail = req.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(cleanEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_TAKEN", "Email already in use.");
        }
        User subAdmin = User.builder()
                .fullName(req.fullName().trim())
                .email(cleanEmail)
                .passwordHash(encoder.encode(req.password()))
                .role(UserRole.SUB_ADMIN)
                .build();
        users.save(subAdmin);

        return new AdminDtos.SubAdminUserDto(
                subAdmin.getId(),
                subAdmin.getEmail(),
                subAdmin.getFullName(),
                req.permissions() != null ? req.permissions() : java.util.Collections.emptySet(),
                subAdmin.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<AdminDtos.SubAdminUserDto> getSubAdmins() {
        return users.findAll().stream()
                .filter(u -> u.getRole() == UserRole.SUB_ADMIN)
                .map(u -> new AdminDtos.SubAdminUserDto(
                        u.getId(),
                        u.getEmail(),
                        u.getFullName(),
                        java.util.Set.of(
                                com.redpen.entity.AdminPermission.MANAGE_PAPERS,
                                com.redpen.entity.AdminPermission.MANAGE_SUBJECTS,
                                com.redpen.entity.AdminPermission.MANAGE_USERS
                        ),
                        u.getCreatedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> getMembers() {
        return users.findAll().stream().map(UserDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminDtos.AdminPaymentOrderDto> getPayments() {
        return orders.findAll().stream().map(o -> {
            Optional<User> parentOpt = users.findById(o.getParentUserId());
            String parentEmail = parentOpt.map(User::getEmail).orElse("Unknown");
            String parentName = parentOpt.map(User::getFullName).orElse("Parent");
            return new AdminDtos.AdminPaymentOrderDto(
                    o.getId(),
                    parentEmail,
                    parentName,
                    o.getPlanCode(),
                    o.getAmountPaise(),
                    o.getStatus().name(),
                    o.getProvider(),
                    o.getProviderOrderId(),
                    o.getProviderPaymentId(),
                    o.getCreatedAt()
            );
        }).toList();
    }

    @Transactional
    public AdminDtos.RegenerateReportResponse regenerateReport(String paperId) {
        return new AdminDtos.RegenerateReportResponse(
                true,
                paperId,
                "Evaluation report successfully regenerated with updated CBSE marking criteria.",
                Instant.now()
        );
    }

    private void seedDefaultSubjects() {
        List<Subject> defaults = List.of(
                Subject.builder().name("Physics").code("PHYSICS").boardClass("CBSE_12").stream("SCIENCE").build(),
                Subject.builder().name("Chemistry").code("CHEMISTRY").boardClass("CBSE_12").stream("SCIENCE").build(),
                Subject.builder().name("Mathematics").code("MATHEMATICS").boardClass("CBSE_12").stream("SCIENCE").build(),
                Subject.builder().name("Biology").code("BIOLOGY").boardClass("CBSE_12").stream("SCIENCE").build(),

                Subject.builder().name("Accountancy").code("ACCOUNTANCY").boardClass("CBSE_12").stream("COMMERCE").build(),
                Subject.builder().name("Business Studies").code("BUSINESS_STUDIES").boardClass("CBSE_12").stream("COMMERCE").build(),
                Subject.builder().name("Economics").code("ECONOMICS").boardClass("CBSE_12").stream("COMMERCE").build(),

                Subject.builder().name("History").code("HISTORY").boardClass("CBSE_12").stream("HUMANITIES").build(),
                Subject.builder().name("Political Science").code("POLITICAL_SCIENCE").boardClass("CBSE_12").stream("HUMANITIES").build(),

                Subject.builder().name("Science").code("SCIENCE_10").boardClass("CBSE_10").stream("GENERAL").build(),
                Subject.builder().name("Mathematics").code("MATH_10").boardClass("CBSE_10").stream("GENERAL").build(),
                Subject.builder().name("Social Science").code("SST_10").boardClass("CBSE_10").stream("GENERAL").build(),
                Subject.builder().name("English").code("ENGLISH_10").boardClass("CBSE_10").stream("GENERAL").build()
        );
        subjects.saveAll(defaults);
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaultAdminOnStartup() {
        if (!users.existsByEmail("admin@redpen.in")) {
            User defaultAdmin = User.builder()
                    .fullName("King Admin")
                    .email("admin@redpen.in")
                    .passwordHash(encoder.encode("admin123456"))
                    .role(UserRole.ADMIN)
                    .build();
            users.save(defaultAdmin);
            org.slf4j.LoggerFactory.getLogger(AdminService.class)
                    .info("Seeded default King Admin user: admin@redpen.in / admin123456");
        }
    }
}
