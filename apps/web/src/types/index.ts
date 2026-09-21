/**
 * SHARED DOMAIN TYPES
 * -------------------
 * These types MUST mirror the backend DTOs in
 * apps/backend/src/main/java/com/redpen/dto/.
 *
 * Change one, change both — and update docs/architecture/api-spec.md.
 */

export type UUID = string;
export type ISODateString = string;

export type UserRole = 'CLIENT' | 'PARENT' | 'STUDENT' | 'STAFF' | 'SUB_ADMIN' | 'ADMIN';
export type AdminPermission =
  | 'MANAGE_PAPERS'
  | 'MANAGE_SUBJECTS'
  | 'MANAGE_USERS'
  | 'VIEW_PAYMENTS'
  | 'REGENERATE_REPORTS';
export type BoardClass = 'CBSE_10' | 'CBSE_12';
export type Stream = 'SCIENCE' | 'COMMERCE' | 'HUMANITIES' | 'GENERAL';
export type PaperStatus = 'DRAFT' | 'UPLOADED' | 'IN_REVIEW' | 'MARKED' | 'DELIVERED';
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
export type PaymentProvider = 'STUB' | 'RAZORPAY' | 'STRIPE';
export type Subject =
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'MATHEMATICS'
  | 'ENGLISH'
  | 'HINDI'
  | 'SOCIAL_SCIENCE'
  | 'ECONOMICS'
  | 'ACCOUNTANCY'
  | 'BUSINESS_STUDIES';

export interface User {
  id: UUID;
  email: string;
  fullName: string;
  role: UserRole;
  familyId: UUID | null;
  targetClass?: string;
  stream?: string;
  activePlan?: string;
  papersRemaining?: number;
  createdAt: ISODateString;
}

export interface AuthResponse {
  token: string;
  expiresAt: ISODateString;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Sent by the frontend after Google Identity Services returns an id_token. */
export interface GoogleLoginRequest {
  idToken: string;
}

/* ── Checkout ─────────────────────────────────────────────────────────── */

/**
 * Server-side plan from the backend catalog (GET /api/checkout/plans).
 * Not to be confused with the marketing Plan type used for pricing cards —
 * that one lives in @/config/site and carries display copy only.
 */
export interface CheckoutPlan {
  code: string;
  name: string;
  description: string;
  paperCount: number;
  amountPaise: number;
  mrpPaise: number;
  validityDays: number;
}

export interface CheckoutRequest {
  planCode: string;
  couponCode?: string;
}

export interface CheckoutResponse {
  orderId: UUID;
  planCode: string;
  amountPaise: number;
  originalAmountPaise: number;
  discountAmountPaise: number;
  mrpPaise: number;
  currency: string;
  provider: PaymentProvider;
  providerOrderId: string;
  razorpayKeyId?: string;
  status: OrderStatus;
}

export interface ValidateCouponRequest {
  couponCode: string;
  planCode: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  couponCode: string;
  discountPercent: number;
  originalAmountPaise: number;
  discountAmountPaise: number;
  finalAmountPaise: number;
  message: string;
}

export interface ConfirmRequest {
  providerPaymentId: string;
  signature?: string;
}

export interface OrderView {
  id: UUID;
  planCode: string;
  amountPaise: number;
  currency: string;
  status: OrderStatus;
  familyId: UUID | null;
  createdAt: ISODateString;
  paidAt: ISODateString | null;
}

/* ── Family / Students ────────────────────────────────────────────────── */

export interface AddStudentRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface FamilyView {
  id: UUID;
  planCode: string;
  planName?: string;
  paperQuota?: number;
  maxStudents?: number;
  active?: boolean;
  paidAt: ISODateString | null;
  validUntil: ISODateString | null;
  parent: User;
  students: User[];
}

export interface Paper {
  id: UUID;
  studentId: UUID;
  boardClass: BoardClass;
  subject: Subject;
  paperNumber: number;
  status: PaperStatus;
  uploadedAt: ISODateString | null;
  markedAt: ISODateString | null;
  totalMarks: number | null;
  awardedMarks: number | null;
}

export interface PaperMarkBreakdown {
  paperId: UUID;
  bars: MarkBar[];
  chapterBars: MarkBar[];
  biggestLeak: string;
}

export interface MarkBar {
  label: string;
  value: string;
  percent: number;
  variant: 'ok' | 'weak' | 'default';
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string>;
}

/* ------------------------------------------------------------------
 * Marketing site content types (consumed by src/config/site.ts and
 * the marketing components under src/components/).
 * ------------------------------------------------------------------ */

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: NavLink[];
}

export interface Step {
  number: string;
  title: string;
  description: string;
  meta: string;
}

export interface ChecklistItem {
  text: string;
  emphasis?: boolean;
}

export interface BarRow {
  label: string;
  value: string;
  percent: number;
  variant: 'ok' | 'weak' | 'default';
}

export interface TrendBar {
  height: number;
  isLast?: boolean;
}

export interface WhoCard {
  tag: string;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  initials: string;
  name: string;
  role: string;
  avatarColor: string;
  quote: string;
  gain?: string;
}

export interface Plan {
  /** Backend plan code (e.g. "FIVE_PAPERS") — must match PlanCatalog on the server. */
  code: string;
  name: string;
  whoFor: string;
  price: string;
  mrp?: string;
  maxStudents?: number;
  per: string;
  features: string[];
  primary?: boolean;
  flag?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  boardClass: string;
  stream: string;
}

export interface SubAdminUser {
  id: string;
  email: string;
  fullName: string;
  permissions: AdminPermission[];
  createdAt: string;
}

export interface AdminOverview {
  totalRevenuePaise: number;
  activeFamiliesCount: number;
  totalStudentsCount: number;
  pendingEvaluationsCount: number;
  completedReportsCount: number;
  totalSubAdminsCount: number;
}

export interface AdminPaymentOrder {
  id: string;
  parentEmail: string;
  parentName: string;
  planCode: string;
  planName?: string;
  amountPaise: number;
  finalAmountPaise?: number;
  appliedCoupon?: string;
  status: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}
