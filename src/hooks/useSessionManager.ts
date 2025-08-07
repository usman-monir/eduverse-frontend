import { useState, useEffect } from 'react';
import { ClassSession } from '@/types';
import {
  getSessions,
  createSession,
  updateSession as apiUpdateSession,
  deleteSession,
  getSessionById as apiGetSessionById,
  approveSlotRequest,
} from '@/services/api';

export const useSessionManager = () => {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions from backend on mount
  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSessions({limit: 1000});
      const sessionsRaw = res.data.data || [];
      // Normalize tutor and studentId to always be strings, and add id field
      const sessions = sessionsRaw.map((s: any) => ({
        ...s,
        id: s._id,
        tutor: s.tutor?.name || s.tutorName || (typeof s.tutor === 'string' ? s.tutor : ''),
        tutorId: s.tutor?._id || s.tutorId || (typeof s.tutor === 'string' ? s.tutor : ''),
        tutorObj: s.tutor,
        studentId: s.studentId?._id || s.studentId?.toString?.() || (typeof s.studentId === 'string' ? s.studentId : ''),
        studentObj: s.studentId,
        date: s.date ? s.date.slice(0, 10) : '',
        createdBy: s.createdBy?._id || s.createdBy || '',
      }));
      setSessions(sessions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (sessionData: Omit<ClassSession, 'id'>) => {
    try {
      await createSession(sessionData);
      await fetchSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session');
    }
  };

  const updateSession = async (id: string, updates: Partial<ClassSession>) => {
    try {
      await apiUpdateSession(id, updates);
      await fetchSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update session');
    }
  };

  const deleteSessionById = async (id: string) => {
    try {
      await deleteSession(id);
      await fetchSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete session');
    }
  };

  const getSessionById = async (id: string) => {
    try {
      const res = await apiGetSessionById(id);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch session');
      return null;
    }
  };

  const approveSlotRequestById = async (id: string, approved: boolean, notes?: string) => {
    try {
      await approveSlotRequest(id, approved, notes);
      await fetchSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve/reject slot request');
    }
  };

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    addSession,
    updateSession,
    deleteSession: deleteSessionById,
    getSessionById,
    approveSlotRequest: approveSlotRequestById,
  };
};
