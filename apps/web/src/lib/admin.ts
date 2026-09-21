import { apiRequest } from '@/lib/api';
import type {
  AdminOverview,
  AdminPaymentOrder,
  AdminPermission,
  SubAdminUser,
  SubjectItem,
  User,
} from '@/types';

export function fetchAdminOverview(): Promise<AdminOverview> {
  return apiRequest<AdminOverview>('/admin/overview');
}

export function fetchSubjects(boardClass?: string, stream?: string): Promise<SubjectItem[]> {
  const params = new URLSearchParams();
  if (boardClass) params.set('boardClass', boardClass);
  if (stream) params.set('stream', stream);
  const q = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<SubjectItem[]>(`/admin/subjects${q}`);
}

export function createSubject(req: {
  name: string;
  code: string;
  boardClass: string;
  stream: string;
}): Promise<SubjectItem> {
  return apiRequest<SubjectItem>('/admin/subjects', {
    method: 'POST',
    body: req,
  });
}

export function fetchSubAdmins(): Promise<SubAdminUser[]> {
  return apiRequest<SubAdminUser[]>('/admin/sub-admins');
}

export function createSubAdmin(req: {
  fullName: string;
  email: string;
  password: string;
  permissions: AdminPermission[];
}): Promise<SubAdminUser> {
  return apiRequest<SubAdminUser>('/admin/sub-admins', {
    method: 'POST',
    body: req,
  });
}

export function fetchMembers(): Promise<User[]> {
  return apiRequest<User[]>('/admin/members');
}

export function fetchAdminPayments(): Promise<AdminPaymentOrder[]> {
  return apiRequest<AdminPaymentOrder[]>('/admin/payments');
}

export function regenerateReport(paperId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(`/admin/reports/${paperId}/regenerate`, {
    method: 'POST',
  });
}
