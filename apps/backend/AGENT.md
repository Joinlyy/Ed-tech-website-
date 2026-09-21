# AGENT.md — apps/backend

Root rules apply first: see [`../../AGENTS.md`](../../AGENTS.md).
This file lists things specific to the Spring Boot workspace.

## Stack

- Java 21 (via toolchain — Gradle will fetch a matching JDK if yours is older).
- Spring Boot 3.3.x — Web, Data JPA, Security, Validation, Actuator.
- Flyway for migrations. PostgreSQL 16 in prod; H2 (PostgreSQL mode) in dev.
- JWT auth via `jjwt`. BCrypt for password hashing.
- Lombok for boilerplate cutting. Records for DTOs.

## Layering (do not skip layers)

```
controller/     REST — thin. Validates input, calls service, returns DTOs.
                Current: AuthController, CheckoutController, FamilyController, PaperController.
service/        Business logic. Transactional. Never returns entities to callers.
                Current: AuthService, OrderService, FamilyService, PaperService,
                         PaymentGateway (interface) + StubPaymentGateway.
repository/     Spring Data JPA interfaces only. No hand-rolled JDBC unless justified.
                Current: UserRepository, FamilyRepository, PaymentOrderRepository, PaperRepository.
entity/         @Entity classes. Do not leak these across the API boundary.
                Current: User, Family, PaymentOrder, Paper + enums (UserRole, OrderStatus,
                         PaperStatus, BoardClass).
dto/            Request / response records. jakarta.validation annotations. PlanCatalog lives here too.
                Current: AuthDtos, CheckoutDtos, FamilyDtos, PaperDto, UserDto, PlanCatalog.
config/         @Configuration beans (Security, CORS, method security, etc.).
security/       JwtService, JwtAuthenticationFilter, GoogleTokenVerifier.
exception/      ApiException + GlobalExceptionHandler for consistent error bodies.
```

Rules:

- Controllers **never** touch repositories directly.
- Services **never** return `Entity` — always map to a DTO.
- Entities **never** contain business logic beyond simple `@PrePersist`.
- No `Map<String, Object>` DTOs. If it needs a shape, give it a record.

## Migrations

- Every schema change is a new Flyway migration file: `V<NNN>__<description>.sql`.
- Never edit a migration that has already been applied anywhere.
- Migrations must run cleanly on both PostgreSQL 16 and H2 (`MODE=PostgreSQL`).
  If you need Postgres-only SQL, put it behind a Flyway callback or a `V<N>__<...>.postgres.sql`
  variant — but the default seed / dev flow must stay H2-friendly.

## Testing

- Unit tests: plain JUnit 5, no Spring context. Fast.
- Slice tests: `@WebMvcTest`, `@DataJpaTest`.
- Integration test: `@SpringBootTest` on the `dev` profile (H2, no Docker). One is
  provided in `RedpenApplicationTests` — keep it green.
- Run: `npm run test:backend` from the repo root.

## Auth model

For the full picture see [`docs/architecture/auth-and-payments.md`](../../docs/architecture/auth-and-payments.md).

- **Two login paths, one app JWT.**
  - `POST /api/auth/login` — email + password. STUDENT, STAFF, ADMIN only.
  - `POST /api/auth/google` — Google ID token verified server-side against Google's
    JWKS. Creates or updates a PARENT user; issues our JWT. PARENT accounts have no
    password.
- **Family model.** One paying parent = one `family` = zero or more `student` users.
  Families are created only after a successful payment (see OrderService.confirmPayment).
- **Post-payment flow.** Parent hits `POST /api/family/students` with the child's
  email + password *that the parent picked themselves*. We never email a password.
- **Public endpoints** (permitted by SecurityConfig): `/api/auth/**`,
  `/api/checkout/plans`, `/actuator/health`, `/actuator/info`, `/h2/**`.
- **Role-guarded**: `/api/checkout` and `/api/family/**` require role PARENT via
  method-level `@PreAuthorize` (enabled by `@EnableMethodSecurity`).
- **JWT** — HS256, `REDPEN_SECURITY_JWT_SECRET` (≥ 32 bytes), 24h TTL. Rotate quarterly.

## Payments

- Pluggable behind `PaymentGateway` (`name`, `createOrder`, `verifyPayment`).
- `StubPaymentGateway` is active when `redpen.payments.provider=STUB` (default).
  Dev only — accepts any confirmation, cannot go to production.
- Real Razorpay: implement `RazorpayGateway`, guard with `@ConditionalOnProperty`,
  add `POST /api/webhooks/razorpay` for async confirmation. Details in
  `docs/architecture/auth-and-payments.md`.
- Money is stored in the smallest currency unit (`amount_paise`, `BIGINT`). Never floats.
- `OrderService.confirmPayment` is idempotent; safe under webhook retries.

## API changes

If you add / rename / remove an endpoint or change a DTO shape, you MUST:

1. Update `docs/architecture/api-spec.md`.
2. Update `apps/web/src/types/index.ts` to keep the web client honest.
3. Add or update a test.

## Validation

Before you say a change is done:

```bash
npm run test:backend
```

For anything that touches SQL or JPA:

```bash
npm run build:backend
```
