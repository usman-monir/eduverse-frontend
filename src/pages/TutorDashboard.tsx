import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager } from '@/hooks/useSessionManager';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ClassSession } from '@/types';
import SessionForm from '@/components/SessionForm';

const TutorDashboard = () => {
  const { user } = useAuth();

  const { sessions, loading, error, addSession, updateSession, deleteSession } =
    useSessionManager();
  const [showCreate, setShowCreate] = useState(false);
  const [editSession, setEditSession] = useState<ClassSession | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const isTutorMatch = (session: any) => {
    // Prefer matching by user id if available, fallback to name
    if (user?.id && session.tutorId) return session.tutorId === user.id;
    return session.tutor === user?.name;
  };
  const todaySessions = sessions.filter(
    (session) =>
      session.status === 'booked' &&
      isTutorMatch(session) &&
      session.date === today
  );
  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === 'booked' &&
      isTutorMatch(session) &&
      session.date > today
  );
  const completedSessions = sessions.filter(
    (session) => session.status === 'completed' && isTutorMatch(session)
  );

  const handleCreateSession = async (sessionData: any) => {
    await addSession(sessionData);
    setShowCreate(false);
  };

  const handleEditSession = async (sessionData: any) => {
    if (editSession) {
      await updateSession(editSession.id, sessionData);
      setEditSession(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <span className='text-lg'>Loading sessions...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-red-500'>Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white'>
          <h1 className='text-3xl font-bold mb-2'>
            Welcome back, {user?.name}!
          </h1>
          <p className='text-green-100'>
            Ready to teach today? You have {todaySessions.length} sessions
            scheduled.
          </p>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Today's Sessions
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{todaySessions.length}</div>
              <p className='text-xs text-muted-foreground'>
                Sessions scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Upcoming Sessions
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {upcomingSessions.length}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total booked sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {completedSessions.length}
              </div>
              <p className='text-xs text-muted-foreground'>
                Sessions completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Session Button */}
        <div className='flex justify-end mb-4'>
          <Button onClick={() => setShowCreate(true)}>
            + Create New Session
          </Button>
        </div>
        {/* Create Session Dialog */}
        {showCreate && (
          <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-lg'>
              <h2 className='text-xl font-bold mb-4'>Create New Session</h2>
              <SessionForm
                onSubmit={handleCreateSession}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          </div>
        )}
        {/* Edit Session Dialog */}
        {editSession && (
          <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-lg'>
              <h2 className='text-xl font-bold mb-4'>Edit Session</h2>
              <SessionForm
                session={editSession}
                onSubmit={handleEditSession}
                onCancel={() => setEditSession(null)}
              />
            </div>
          </div>
        )}

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
            <CardDescription>Your scheduled classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {todaySessions.length > 0 ? (
                todaySessions.map((session) => (
                  <div
                    key={session.id || (session as any)._id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='space-y-1'>
                      <h3 className='font-semibold'>{session.subject}</h3>
                      <div className='flex items-center space-x-4 text-sm text-gray-600'>
                        <span>🕐 {session.time}</span>
                        <span>⏰ {session.duration}</span>
                        <span>👨‍🎓 Student ID: {session.studentId}</span>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge className='bg-blue-100 text-blue-800'>
                        {session.status}
                      </Badge>
                      <Button size='sm'>Start Session</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-gray-500 text-center py-8'>
                  No sessions scheduled for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>All your booked sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {upcomingSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id || (session as any)._id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='space-y-1'>
                    <h3 className='font-semibold'>{session.subject}</h3>
                    <div className='flex items-center space-x-4 text-sm text-gray-600'>
                      <span>📅 {session.date}</span>
                      <span>🕐 {session.time}</span>
                      <span>⏰ {session.duration}</span>
                      {session.studentId && (
                        <span>👨‍🎓 Student ID: {session.studentId}</span>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge
                      variant={
                        session.status === 'booked' ? 'default' : 'secondary'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TutorDashboard;
