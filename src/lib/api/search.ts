import api from './axios';
import type { TalentProfile, Project, SearchParams, MatchResult } from '@/types';

export const searchAPI = {
  /**
   * AI-powered talent search
   */
  searchTalents: async (params: SearchParams) => {
    const response = await api.post('/search/talents', params);
    return response.data;
  },

  /**
   * Match talents to a specific project
   */
  matchTalentsToProject: async (projectId: number, params?: any) => {
    const response = await api.post(`/projects/${projectId}/match-talents`, params);
    return response.data;
  },

  /**
   * Match projects to a specific talent
   */
  matchProjectsToTalent: async (talentId: number, params?: any) => {
    const response = await api.post(`/talents/${talentId}/match-projects`, params);
    return response.data;
  },

  /**
   * Get personalized recommendations for a talent
   */
  getTalentRecommendations: async (talentId: number) => {
    const response = await api.get(`/talents/${talentId}/recommendations`);
    return response.data;
  },

  /**
   * Find similar portfolios
   */
  getSimilarPortfolios: async (portfolioId: number) => {
    const response = await api.get(`/portfolios/${portfolioId}/similar`);
    return response.data;
  },

  /**
   * Get related skills
   */
  getRelatedSkills: async (skillId: number) => {
    const response = await api.get(`/skills/${skillId}/related`);
    return response.data;
  },
};