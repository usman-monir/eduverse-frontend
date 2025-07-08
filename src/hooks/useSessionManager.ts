
import { useState, useEffect } from 'react';
import { ClassSession } from '@/types';
import { mockClassSessions } from '@/data/mockData';

export const useSessionManager = () => {
  const [sessions, setSessions] = useState<ClassSession[]>(mockClassSessions);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('classSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('classSessions', JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (sessionData: Omit<ClassSession, 'id'>) => {
    const newSession: ClassSession = {
      ...sessionData,
      id: Date.now().toString(),
      meetingLink: `https://meet.google.com/new`, // Auto-generate meeting link
    };
    setSessions(prev => [...prev, newSession]);
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<ClassSession>) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === id ? { ...session, ...updates } : session
      )
    );
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  const getSessionById = (id: string) => {
    return sessions.find(session => session.id === id);
  };

  return {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    getSessionById
  };
};
