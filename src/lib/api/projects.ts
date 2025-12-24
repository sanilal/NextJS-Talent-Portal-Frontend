import api from './axios';
import type { 
  Project, 
  ProjectFormData, 
  PaginatedResponse,
  ApiResponse 
} from '@/types';

export const projectsAPI = {
  // ====================================
  // RECRUITER ENDPOINTS (Protected)
  // ====================================

  /**
   * Get recruiter's projects
   * GET /api/v1/recruiter/projects
   */
  getRecruiterProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) => {
    const response = await api.get<PaginatedResponse<Project>>('/recruiter/projects', { params });
    return response.data;
  },

  /**
   * Get single project by ID (Recruiter view)
   * GET /api/v1/recruiter/projects/{id}
   */
  getRecruiterProject: async (id: number | string) => {
    const response = await api.get<ApiResponse<Project>>(`/recruiter/projects/${id}`);
    return response.data;
  },

  /**
   * Create new project (recruiter only)
   * POST /api/v1/recruiter/projects ✅ FIXED
   */
  createProject: async (data: ProjectFormData) => {
    const response = await api.post<ApiResponse<Project>>('/recruiter/projects', data);
    return response.data;
  },

  /**
   * Update project
   * PUT /api/v1/recruiter/projects/{id}
   */
  updateProject: async (id: number | string, data: Partial<ProjectFormData>) => {
    const response = await api.put<ApiResponse<Project>>(`/recruiter/projects/${id}`, data);
    return response.data;
  },

  /**
   * Delete project
   * DELETE /api/v1/recruiter/projects/{id}
   */
  deleteProject: async (id: number | string) => {
    const response = await api.delete<ApiResponse>(`/recruiter/projects/${id}`);
    return response.data;
  },

  /**
   * Publish project
   * POST /api/v1/recruiter/projects/{id}/publish
   */
  publishProject: async (id: number | string) => {
    const response = await api.post<ApiResponse<Project>>(`/recruiter/projects/${id}/publish`);
    return response.data;
  },

  /**
   * Close project
   * POST /api/v1/recruiter/projects/{id}/close
   */
  closeProject: async (id: number | string) => {
    const response = await api.post<ApiResponse<Project>>(`/recruiter/projects/${id}/close`);
    return response.data;
  },

  // ====================================
  // PUBLIC/TALENT ENDPOINTS
  // ====================================

  /**
   * Get public projects (for talents browsing)
   * GET /api/v1/projects
   */
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    project_type_id?: number;
    category_id?: string;
    budget_min?: number;
    budget_max?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) => {
    const response = await api.get<PaginatedResponse<Project>>('/projects', { params });
    return response.data;
  },

  /**
   * Get single public project
   * GET /api/v1/projects/{id}
   */
  getProject: async (id: number | string) => {
    const response = await api.get<ApiResponse<Project & { has_applied: boolean }>>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Apply to a project
   * POST /api/v1/projects/{id}/apply
   */
  applyToProject: async (id: number | string, data: {
    cover_letter?: string;
    proposed_budget?: number;
    estimated_duration?: number;
    portfolio_links?: string[];
    answers?: any[];
  }) => {
    const response = await api.post<ApiResponse>(`/projects/${id}/apply`, data);
    return response.data;
  },

  /**
   * Get project applications (recruiter view)
   * GET /api/v1/recruiter/projects/{id}/applications
   * 
   * Note: Based on your routes, this doesn't exist yet.
   * The route is: GET /api/v1/recruiter/applications (all applications)
   * You may want to add this route to your backend.
   */
  getProjectApplications: async (id: number | string) => {
    const response = await api.get(`/recruiter/projects/${id}/applications`);
    return response.data;
  },

  /**
   * Search projects (if you implement this endpoint)
   * For now, use getProjects with search param
   */
  searchProjects: async (query: string, filters?: any) => {
    return projectsAPI.getProjects({ search: query, ...filters });
  },

  // ====================================
  // LEGACY/COMPATIBILITY (if needed)
  // ====================================

  /**
   * Get public projects via /public prefix
   * GET /api/v1/public/projects
   */
  getPublicProjects: async (params?: any) => {
    const response = await api.get<PaginatedResponse<Project>>('/public/projects', { params });
    return response.data;
  },

  /**
   * Get public project details via /public prefix
   * GET /api/v1/public/projects/{id}
   */
  getPublicProject: async (id: number | string) => {
    const response = await api.get<ApiResponse<Project>>(`/public/projects/${id}`);
    return response.data;
  },
};

// Export individual functions if needed
export const {
  createProject,
  getRecruiterProjects,
  getRecruiterProject,
  updateProject,
  deleteProject,
  publishProject,
  closeProject,
  getProjects,
  getProject,
  applyToProject,
} = projectsAPI;