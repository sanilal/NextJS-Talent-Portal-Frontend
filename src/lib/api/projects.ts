import api from './axios';
import type { 
  Project, 
  ProjectFormData, 
  PaginatedResponse,
  ApiResponse 
} from '@/types';

export const projectsAPI = {
  /**
   * Get all projects with pagination
   */
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category_id?: number;
    experience_level?: string;
  }) => {
    const response = await api.get<PaginatedResponse<Project>>('/projects', { params });
    return response.data;
  },

  /**
   * Get single project by ID
   */
  getProject: async (id: number) => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create new project (recruiter only)
   */
  createProject: async (data: ProjectFormData) => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  /**
   * Update project
   */
  updateProject: async (id: number, data: Partial<ProjectFormData>) => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Delete project
   */
  deleteProject: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Publish project
   */
  publishProject: async (id: number) => {
    const response = await api.post<Project>(`/projects/${id}/publish`);
    return response.data;
  },

  /**
   * Close project
   */
  closeProject: async (id: number) => {
    const response = await api.post<Project>(`/projects/${id}/close`);
    return response.data;
  },

  /**
   * Get project applications
   */
  getProjectApplications: async (id: number) => {
    const response = await api.get(`/projects/${id}/applications`);
    return response.data;
  },

  /**
   * Search projects
   */
  searchProjects: async (query: string, filters?: any) => {
    const response = await api.get('/projects/search', {
      params: { query, ...filters },
    });
    return response.data;
  },

  /**
   * Get public projects (no auth required)
   */
  getPublicProjects: async (params?: any) => {
    const response = await api.get<PaginatedResponse<Project>>('/public/projects', { params });
    return response.data;
  },

  /**
   * Get public project details (no auth required)
   */
  getPublicProject: async (id: number) => {
    const response = await api.get<Project>(`/public/projects/${id}`);
    return response.data;
  },
};