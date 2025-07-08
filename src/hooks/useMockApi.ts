
import { useState, useEffect } from 'react';
import { mockApi } from '@/services/mockApi';

export const useMockApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRequest = async <T>(
    apiCall: () => Promise<{ data: T; success: boolean; error?: string }>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Request failed');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    executeRequest,
    api: mockApi
  };
};

// Specific hooks for common operations
export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const { loading, error, executeRequest } = useMockApi();

  const fetchUsers = async () => {
    const data = await executeRequest(() => mockApi.getUsers());
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

export const useSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const { loading, error, executeRequest } = useMockApi();

  const fetchSessions = async () => {
    const data = await executeRequest(() => mockApi.getSessions());
    if (data) setSessions(data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { sessions, loading, error, refetch: fetchSessions };
};

export const useStudyMaterials = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const { loading, error, executeRequest } = useMockApi();

  const fetchMaterials = async () => {
    const data = await executeRequest(() => mockApi.getStudyMaterials());
    if (data) setMaterials(data);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return { materials, loading, error, refetch: fetchMaterials };
};
