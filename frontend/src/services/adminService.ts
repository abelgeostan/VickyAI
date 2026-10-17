import { apiFetch } from './api';
import {
  AdminStats,
  AdminUserListResponse,
  AdminUsageResponse,
  AdminSystemResponse,
  AdminCleanupResponse,
} from '../types/admin';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return apiFetch<AdminStats>('/admin/stats');
  },

  async getUsers(): Promise<AdminUserListResponse> {
    return apiFetch<AdminUserListResponse>('/admin/users');
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getUsage(): Promise<AdminUsageResponse> {
    return apiFetch<AdminUsageResponse>('/admin/usage');
  },

  async getSystem(): Promise<AdminSystemResponse> {
    return apiFetch<AdminSystemResponse>('/admin/system');
  },

  async runCleanup(): Promise<AdminCleanupResponse> {
    return apiFetch<AdminCleanupResponse>('/admin/maintenance/cleanup', {
      method: 'POST',
    });
  },
};
