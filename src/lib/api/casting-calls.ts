import axios from './axios';
import {
  CastingCall,
  CastingCallsResponse,
  CastingCallResponse,
  CreateCastingCallRequest,
  UpdateCastingCallRequest,
  CastingCallFilters,
  Genre,
  DropdownValuesResponse,
} from '@/types/casting-calls';

// ============================================
// PUBLIC CASTING CALLS API
// ============================================

/**
 * Get all public casting calls with filters
 */
export const getCastingCalls = async (
  filters?: CastingCallFilters
): Promise<CastingCallsResponse> => {
  const response = await axios.get('/v1/casting-calls', { params: filters });
  return response.data;
};

/**
 * Get single casting call by ID
 */
export const getCastingCall = async (id: string): Promise<CastingCallResponse> => {
  const response = await axios.get(`/v1/casting-calls/${id}`);
  return response.data;
};

// ============================================
// RECRUITER CASTING CALLS API
// ============================================

/**
 * Get recruiter's casting calls
 */
export const getRecruiterCastingCalls = async (
  filters?: CastingCallFilters
): Promise<CastingCallsResponse> => {
  const response = await axios.get('/v1/recruiter/casting-calls', { params: filters });
  return response.data;
};

/**
 * Create new casting call
 */
export const createCastingCall = async (
  data: CreateCastingCallRequest
): Promise<CastingCallResponse> => {
  const response = await axios.post('/v1/recruiter/casting-calls', data);
  return response.data;
};

/**
 * Update casting call
 */
export const updateCastingCall = async (
  id: string,
  data: UpdateCastingCallRequest
): Promise<CastingCallResponse> => {
  const response = await axios.put(`/v1/recruiter/casting-calls/${id}`, data);
  return response.data;
};

/**
 * Delete casting call
 */
export const deleteCastingCall = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`/v1/recruiter/casting-calls/${id}`);
  return response.data;
};

/**
 * Publish casting call
 */
export const publishCastingCall = async (id: string): Promise<CastingCallResponse> => {
  const response = await axios.post(`/v1/recruiter/casting-calls/${id}/publish`);
  return response.data;
};

/**
 * Close casting call
 */
export const closeCastingCall = async (id: string): Promise<CastingCallResponse> => {
  const response = await axios.post(`/v1/recruiter/casting-calls/${id}/close`);
  return response.data;
};

// ============================================
// GENRES API
// ============================================

/**
 * Get all genres
 */
export const getGenres = async (): Promise<{ success: boolean; message: string; data: Genre[] }> => {
  const response = await axios.get('/v1/public/genres');
  return response.data;
};

/**
 * Get single genre
 */
export const getGenre = async (id: string): Promise<{ success: boolean; message: string; data: Genre }> => {
  const response = await axios.get(`/v1/public/genres/${id}`);
  return response.data;
};

// ============================================
// DROPDOWN VALUES API (for casting calls)
// ============================================

/**
 * Get age groups
 */
export const getAgeGroups = async (): Promise<DropdownValuesResponse> => {
  const response = await axios.get('/v1/public/dropdown-list', {
    params: { type: 4 }, // TYPE_AGE_GROUP
  });
  return response.data;
};

/**
 * Get skin tones
 */
export const getSkinTones = async (): Promise<DropdownValuesResponse> => {
  const response = await axios.get('/v1/public/dropdown-list', {
    params: { type: 2 }, // TYPE_SKIN_TONE
  });
  return response.data;
};

/**
 * Get heights
 */
export const getHeights = async (): Promise<DropdownValuesResponse> => {
  const response = await axios.get('/v1/public/dropdown-list', {
    params: { type: 1 }, // TYPE_HEIGHT
  });
  return response.data;
};

/**
 * Get genders
 */
export const getGenders = async (): Promise<DropdownValuesResponse> => {
  const response = await axios.get('/v1/public/dropdown-list', {
    params: { type: 5 }, // TYPE_GENDER
  });
  return response.data;
};

/**
 * Get multiple dropdown types at once
 */
export const getCastingCallDropdowns = async () => {
  const response = await axios.post('/v1/public/dropdown-list/multiple', {
    types: [1, 2, 4, 5], // HEIGHT, SKIN_TONE, AGE_GROUP, GENDER
  });
  return response.data;
};