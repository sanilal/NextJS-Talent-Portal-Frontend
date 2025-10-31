import api from './axios';
import type { Application, ApiResponse, PaginatedResponse } from '@/types';

export const applicationsAPI = {
  /**
   * Apply to a project
   */
  apply: async (data: {
    project_id: number;
    cover_letter?: string;
    proposed_rate?: number;
    proposed_duration?: number;
    availability_date?: string;
  }) => {
    const response = await api.post<Application>('/applications', data);
    return response.data;
  },

  /**
   * Get talent's applications
   */
  getTalentApplications: async (params?: any) => {
    const response = await api.get<{ applications: Application[] }>('/talent/applications', { params });
    // Transform API response to match expected PaginatedResponse format
    return {
      data: response.data.applications || [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: response.data.applications?.length || 0,
        total: response.data.applications?.length || 0,
      }
    };
  },

  /**
   * Get single application
   */
  getApplication: async (id: number) => {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Withdraw application
   */
  withdrawApplication: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Update application status (recruiter only)
   */
  updateApplicationStatus: async (id: number, status: string) => {
    const response = await api.put<Application>(`/applications/${id}/status`, { status });
    return response.data;
  },

  /**
   * Add note to application (recruiter only)
   */
  addNote: async (id: number, note: string) => {
    const response = await api.post(`/applications/${id}/notes`, { note });
    return response.data;
  },

  /**
   * Get recruiter's received applications
   */
  getRecruiterApplications: async (params?: any) => {
    const response = await api.get<{ applications: Application[] }>('/recruiter/applications', { params });
    // Transform API response to match expected PaginatedResponse format
    return {
      data: response.data.applications || [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: response.data.applications?.length || 0,
        total: response.data.applications?.length || 0,
      }
    };
  },
};