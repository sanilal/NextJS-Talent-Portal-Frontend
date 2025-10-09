import api, { uploadFile } from './axios';
import type { 
  TalentProfile, 
  TalentSkill, 
  Experience, 
  Education, 
  Portfolio,
  ApiResponse 
} from '@/types';

export const talentsAPI = {
  /**
   * Get talent profile
   */
  getProfile: async () => {
    const response = await api.get<TalentProfile>('/talent/profile');
    return response.data;
  },

  /**
   * Update talent profile
   */
  updateProfile: async (data: Partial<TalentProfile>) => {
    const response = await api.put<TalentProfile>('/talent/profile', data);
    return response.data;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');
    const response = await uploadFile('/talent/profile/avatar', formData);
    return response.data;
  },

  /**
   * Get talent dashboard stats
   */
  getDashboard: async () => {
    const response = await api.get('/talent/dashboard');
    return response.data;
  },

  // ============= Skills =============

  /**
   * Get talent skills
   */
  getSkills: async () => {
    const response = await api.get<TalentSkill[]>('/talent/skills');
    return response.data;
  },

  /**
   * Add skill
   */
  addSkill: async (data: {
    skill_id: number;
    proficiency_level: string;
    years_of_experience?: number;
  }) => {
    const response = await api.post<TalentSkill>('/talent/skills', data);
    return response.data;
  },

  /**
   * Update skill
   */
  updateSkill: async (id: number, data: Partial<TalentSkill>) => {
    const response = await api.put<TalentSkill>(`/talent/skills/${id}`, data);
    return response.data;
  },

  /**
   * Delete skill
   */
  deleteSkill: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/talent/skills/${id}`);
    return response.data;
  },

  // ============= Experience =============

  /**
   * Get experiences
   */
  getExperiences: async () => {
    const response = await api.get<Experience[]>('/talent/experiences');
    return response.data;
  },

  /**
   * Add experience
   */
  addExperience: async (data: Partial<Experience>) => {
    const response = await api.post<Experience>('/talent/experiences', data);
    return response.data;
  },

  /**
   * Update experience
   */
  updateExperience: async (id: number, data: Partial<Experience>) => {
    const response = await api.put<Experience>(`/talent/experiences/${id}`, data);
    return response.data;
  },

  /**
   * Delete experience
   */
  deleteExperience: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/talent/experiences/${id}`);
    return response.data;
  },

  // ============= Education =============

  /**
   * Get education
   */
  getEducation: async () => {
    const response = await api.get<Education[]>('/talent/education');
    return response.data;
  },

  /**
   * Add education
   */
  addEducation: async (data: Partial<Education>) => {
    const response = await api.post<Education>('/talent/education', data);
    return response.data;
  },

  /**
   * Update education
   */
  updateEducation: async (id: number, data: Partial<Education>) => {
    const response = await api.put<Education>(`/talent/education/${id}`, data);
    return response.data;
  },

  /**
   * Delete education
   */
  deleteEducation: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/talent/education/${id}`);
    return response.data;
  },

  // ============= Portfolio =============

  /**
   * Get portfolios
   */
  getPortfolios: async () => {
    const response = await api.get<Portfolio[]>('/talent/portfolios');
    return response.data;
  },

  /**
   * Add portfolio
   */
  addPortfolio: async (data: FormData) => {
    const response = await uploadFile('/talent/portfolios', data);
    return response.data;
  },

  /**
   * Update portfolio
   */
  updatePortfolio: async (id: number, data: FormData) => {
    const response = await uploadFile(`/talent/portfolios/${id}`, data);
    return response.data;
  },

  /**
   * Delete portfolio
   */
  deletePortfolio: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/talent/portfolios/${id}`);
    return response.data;
  },

  // ============= Public =============

  /**
   * Get public talent profile
   */
  getPublicProfile: async (id: number) => {
    const response = await api.get<TalentProfile>(`/public/talents/${id}`);
    return response.data;
  },

  /**
   * Search public talents
   */
  searchPublicTalents: async (params?: any) => {
    const response = await api.get('/public/talents', { params });
    return response.data;
  },
};