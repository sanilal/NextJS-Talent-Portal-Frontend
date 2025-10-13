import { useState, useEffect } from 'react';
import { api } from '@/lib/api/axios';

interface DashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    account_status: string;
  };
  profile: any;
  stats: any;
  [key: string]: any;
}

export function useDashboard(userType: 'talent' | 'recruiter') {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/v1/${userType}/dashboard`);
      setData(response.data);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [userType]);

  return { data, loading, error, refetch: fetchDashboard };
}