/**
 * Email Verification API Service
 * Handles OTP verification for email addresses
 */

import api from './axios';

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface VerificationStatusResponse {
  is_verified: boolean;
  email: string;
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  user: any;
  token?: string;
}

export interface ResendOtpResponse {
  message: string;
  success: boolean;
}

export const verificationApi = {
  /**
   * Verify OTP code
   * POST /api/v1/auth/email/verify
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await api.post('/auth/email/verify', data);
    return response.data;
  },

  /**
   * Resend OTP code
   * POST /api/v1/auth/email/resend
   */
  resendOtp: async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const response = await api.post('/auth/email/resend', data);
    return response.data;
  },

  /**
   * Check verification status
   * GET /api/v1/auth/email/status?email=user@example.com
   */
  getStatus: async (email: string): Promise<VerificationStatusResponse> => {
    const response = await api.get(`/auth/email/status?email=${encodeURIComponent(email)}`);
    return response.data;
  },
};

export default verificationApi;