import type {
  AddStudentRequest,
  CheckoutPlan,
  CheckoutResponse,
  CouponValidationResponse,
  FamilyView,
  OrderView,
  User,
} from '@/types';
import { apiRequest } from '@/lib/api';

export function listPlans(): Promise<CheckoutPlan[]> {
  return apiRequest<CheckoutPlan[]>('/checkout/plans', { auth: false });
}

export function validateCoupon(couponCode: string, planCode: string): Promise<CouponValidationResponse> {
  return apiRequest<CouponValidationResponse>('/checkout/validate-coupon', {
    method: 'POST',
    auth: false,
    body: { couponCode, planCode },
  });
}

export function createCheckout(planCode: string, couponCode?: string): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>('/checkout', {
    method: 'POST',
    body: { planCode, couponCode },
  });
}

export function confirmPayment(
  orderId: string,
  providerPaymentId: string,
  signature?: string
): Promise<OrderView> {
  return apiRequest<OrderView>(`/checkout/${orderId}/confirm`, {
    method: 'POST',
    body: { providerPaymentId, signature },
  });
}

export function addStudent(req: AddStudentRequest): Promise<User> {
  return apiRequest<User>('/family/students', {
    method: 'POST',
    body: req,
  });
}

export function fetchFamily(): Promise<FamilyView> {
  return apiRequest<FamilyView>('/family/me');
}
