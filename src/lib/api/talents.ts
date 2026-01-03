import api, { uploadFile } from './axios';
import type { 
  TalentProfile, 
  TalentSkill, 
  Experience, 
  Education, 
  Portfolio,
  Skill,
  Category,
  ApiResponse,
  PaginatedResponse,
  TalentFilters,
  TalentStats,
  CreateTalentSkillPayload,
  UpdateTalentSkillPayload,
  ReorderSkillsPayload
} from '@/types';

export const talentsAPI = {
  // ============= Profile =============

  /**
   * Get talent profile
   */
  getProfile: async () => {
    const response = await api.get<ApiResponse<TalentProfile>>('/talent/profile');
    return response.data;
  },

  /**
   * Update talent profile
   */
  updateProfile: async (data: Partial<TalentProfile>) => {
    const response = await api.put<ApiResponse<TalentProfile>>('/talent/profile', data);
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

  // ============= Skills ============= (UPDATED)

  /**
   * Get current user's skills
   */
  getSkills: async () => {
    const response = await api.get<ApiResponse<TalentSkill[]>>('/talent/skills');
    return response.data;
  },

  /**
   * Get a specific skill
   */
  getSkill: async (id: number) => {
    const response = await api.get<ApiResponse<TalentSkill>>(`/talent/skills/${id}`);
    return response.data;
  },

  /**
   * Add a new skill with optional image
   */
  addSkill: async (skillData: CreateTalentSkillPayload) => {
    const formData = new FormData();
    
    // Add all fields to FormData
    formData.append('skill_id', String(skillData.skill_id));
    
    if (skillData.description) {
      formData.append('description', skillData.description);
    }
    
    if (skillData.proficiency_level) {
      formData.append('proficiency_level', skillData.proficiency_level);
    }
    
    if (skillData.years_of_experience !== undefined) {
      formData.append('years_of_experience', String(skillData.years_of_experience));
    }
    
    if (skillData.certifications) {
      formData.append('certifications', JSON.stringify(skillData.certifications));
    }
    
    if (skillData.image instanceof File) {
      formData.append('image', skillData.image);
    }
    
    if (skillData.video_url) {
      formData.append('video_url', skillData.video_url);
    }
    
    if (skillData.is_primary !== undefined) {
      formData.append('is_primary', String(skillData.is_primary));
    }
    
    if (skillData.display_order !== undefined) {
      formData.append('display_order', String(skillData.display_order));
    }
    
    if (skillData.show_on_profile !== undefined) {
      formData.append('show_on_profile', String(skillData.show_on_profile));
    }

    const response = await api.post<ApiResponse<TalentSkill>>(
      '/talent/skills', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Update an existing skill
   */
  updateSkill: async (id: number, skillData: UpdateTalentSkillPayload) => {
    const formData = new FormData();
    
    // Laravel requires _method for multipart PUT
    formData.append('_method', 'PUT');
    
    // Add all provided fields
    if (skillData.description !== undefined) {
      formData.append('description', skillData.description);
    }
    
    if (skillData.proficiency_level) {
      formData.append('proficiency_level', skillData.proficiency_level);
    }
    
    if (skillData.years_of_experience !== undefined) {
      formData.append('years_of_experience', String(skillData.years_of_experience));
    }
    
    if (skillData.certifications) {
      formData.append('certifications', JSON.stringify(skillData.certifications));
    }
    
    if (skillData.image instanceof File) {
      formData.append('image', skillData.image);
    }
    
    if (skillData.video_url !== undefined) {
      formData.append('video_url', skillData.video_url);
    }
    
    if (skillData.is_primary !== undefined) {
      formData.append('is_primary', String(skillData.is_primary));
    }
    
    if (skillData.display_order !== undefined) {
      formData.append('display_order', String(skillData.display_order));
    }
    
    if (skillData.show_on_profile !== undefined) {
      formData.append('show_on_profile', String(skillData.show_on_profile));
    }

    const response = await api.post<ApiResponse<TalentSkill>>(
      `/talent/skills/${id}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete a skill
   */
  deleteSkill: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/talent/skills/${id}`);
    return response.data;
  },

  /**
   * Reorder skills (batch update display_order)
   */
  reorderSkills: async (payload: ReorderSkillsPayload) => {
    const response = await api.post<ApiResponse>('/talent/skills/reorder', payload);
    return response.data;
  },

  /**
   * Set a skill as primary
   */
  setPrimarySkill: async (id: number) => {
    const response = await api.post<ApiResponse<TalentSkill>>(
      `/talent/skills/${id}/set-primary`
    );
    return response.data;
  },

  // ============= Experience =============

  /**
   * Get experiences
   */
  getExperiences: async () => {
    const response = await api.get<ApiResponse<Experience[]>>('/talent/experiences');
    return response.data;
  },

  /**
   * Add experience
   */
  addExperience: async (data: Partial<Experience>) => {
    const response = await api.post<ApiResponse<Experience>>('/talent/experiences', data);
    return response.data;
  },

  /**
   * Update experience
   */
  updateExperience: async (id: number, data: Partial<Experience>) => {
    const response = await api.put<ApiResponse<Experience>>(
      `/talent/experiences/${id}`, 
      data
    );
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
    const response = await api.get<ApiResponse<Education[]>>('/talent/education');
    return response.data;
  },

  /**
   * Add education
   */
  addEducation: async (data: Partial<Education>) => {
    const response = await api.post<ApiResponse<Education>>('/talent/education', data);
    return response.data;
  },

  /**
   * Update education
   */
  updateEducation: async (id: number, data: Partial<Education>) => {
    const response = await api.put<ApiResponse<Education>>(
      `/talent/education/${id}`, 
      data
    );
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
    const response = await api.get<ApiResponse<Portfolio[]>>('/talent/portfolios');
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

  // ============= Public Endpoints ============= (UPDATED)

  /**
   * Get public talent directory with filters
   */
  getPublicTalents: async (filters?: TalentFilters) => {
    const response = await api.get<ApiResponse<PaginatedResponse<TalentProfile>>>(
      '/public/talents', 
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get individual public talent profile with stats
   */
  getPublicTalent: async (id: number | string) => {
    const response = await api.get<ApiResponse<{
      talent: TalentProfile;
      stats: TalentStats;
    }>>(`/public/talents/${id}`);
    return response.data;
  },

  /**
   * Get all available skills (public)
   */
  getPublicSkills: async () => {
    const response = await api.get<ApiResponse<Skill[]>>('/public/skills');
    return response.data;
  },

  /**
   * Get all categories with talent counts (public)
   */
  getPublicCategories: async () => {
    const response = await api.get<ApiResponse<Category[]>>('/public/categories');
    return response.data;
  },

  /**
   * ✅ FIXED: Get subcategories for a specific category
   * Note: Backend does NOT support getting all subcategories without categoryId
   * Use getPublicCategories() and extract subcategories from nested data instead
   */
  getPublicSubcategories: async (categoryId: string | number) => {
    try {
      // Get subcategories for specific category
      const response = await api.get<ApiResponse<any[]>>(
        `/public/categories/${categoryId}/subcategories`
      );
      return response.data;
    } catch (error: any) {
      console.error('Get subcategories error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Global search (talents, skills, projects)
   */
  globalSearch: async (query: string) => {
    const response = await api.get<ApiResponse<{
      talents: TalentProfile[];
      skills: Skill[];
      projects?: any[];
    }>>('/public/search', { params: { q: query } });
    return response.data;
  },

  /**
   * @deprecated Use getPublicTalents instead
   */
  searchPublicTalents: async (params?: any) => {
    console.warn('searchPublicTalents is deprecated, use getPublicTalents instead');
    return talentsAPI.getPublicTalents(params);
  },

  /**
   * @deprecated Use getPublicTalent instead
   */
  getPublicProfile: async (id: number) => {
    console.warn('getPublicProfile is deprecated, use getPublicTalent instead');
    return talentsAPI.getPublicTalent(id);
  },
};

// Export individual namespaces if preferred
export const profileAPI = {
  get: talentsAPI.getProfile,
  update: talentsAPI.updateProfile,
  uploadAvatar: talentsAPI.uploadAvatar,
  getDashboard: talentsAPI.getDashboard,
};

export const skillsAPI = {
  list: talentsAPI.getSkills,
  get: talentsAPI.getSkill,
  create: talentsAPI.addSkill,
  update: talentsAPI.updateSkill,
  delete: talentsAPI.deleteSkill,
  reorder: talentsAPI.reorderSkills,
  setPrimary: talentsAPI.setPrimarySkill,
};

export const experiencesAPI = {
  list: talentsAPI.getExperiences,
  create: talentsAPI.addExperience,
  update: talentsAPI.updateExperience,
  delete: talentsAPI.deleteExperience,
};

export const educationAPI = {
  list: talentsAPI.getEducation,
  create: talentsAPI.addEducation,
  update: talentsAPI.updateEducation,
  delete: talentsAPI.deleteEducation,
};

export const portfoliosAPI = {
  list: talentsAPI.getPortfolios,
  create: talentsAPI.addPortfolio,
  update: talentsAPI.updatePortfolio,
  delete: talentsAPI.deletePortfolio,
};

export const publicTalentsAPI = {
  list: talentsAPI.getPublicTalents,
  get: talentsAPI.getPublicTalent,
  skills: talentsAPI.getPublicSkills,
  categories: talentsAPI.getPublicCategories,
  subcategories: talentsAPI.getPublicSubcategories,
  search: talentsAPI.globalSearch,
};

// ============================================
// ✅ UPDATED: Named export for casting calls compatibility
// Now requires categoryId parameter
// ============================================

/**
 * Get subcategories for a specific category
 * Wrapper around talentsAPI.getPublicSubcategories() for named import compatibility
 * 
 * @param categoryId - UUID of the category
 * @returns Promise with subcategories data
 */
export const getSubcategories = (categoryId: string | number) => 
  talentsAPI.getPublicSubcategories(categoryId);

export default talentsAPI;