import React from 'react';
import { getSessions } from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Users, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSessions();
        setSessions(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSessions = sessions.length;
  const bookedSessions = sessions.filter((s) => s.status === 'booked').length;
  const availableSessions = sessions.filter(
    (s) => s.status === 'available'
  ).length;
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className='bg-green-100 text-green-800'>Available</Badge>;
      case 'booked':
        return <Badge className='bg-blue-100 text-blue-800'>Booked</Badge>;
      case 'completed':
        return <Badge className='bg-gray-100 text-gray-800'>Completed</Badge>;
      default:
        return null;
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
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold mb-2'>Admin Dashboard</h1>
          <p className='text-gray-600'>
            Manage sessions, study materials, and student progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Sessions
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalSessions}</div>
              <p className='text-xs text-muted-foreground'>All time sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Booked Sessions
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {bookedSessions}
              </div>
              <p className='text-xs text-muted-foreground'>
                Currently scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Available Slots
              </CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {availableSessions}
              </div>
              <p className='text-xs text-muted-foreground'>Open for booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Completion Rate
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {totalSessions > 0
                  ? Math.round((completedSessions / totalSessions) * 100)
                  : 0}
                %
              </div>
              <p className='text-xs text-muted-foreground'>
                Sessions completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Overview of all class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id || session._id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='space-y-1'>
                    <h3 className='font-semibold'>{session.subject}</h3>
                    <div className='flex items-center space-x-4 text-sm text-gray-600'>
                      <span>
                        👨‍🏫{' '}
                        {session.tutorName ||
                          (session.tutor && session.tutor.name) ||
                          session.tutor}
                      </span>
                      <span>📅 {session.date}</span>
                      <span>🕐 {session.time}</span>
                      <span>⏰ {session.duration}</span>
                    </div>
                    {session.studentId && (
                      <p className='text-sm text-blue-600'>
                        Student ID:{' '}
                        {session.studentId.name || session.studentId}
                      </p>
                    )}
                  </div>
                  <div className='flex items-center space-x-2'>
                    {getStatusBadge(session.status)}
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

export default AdminDashboard;
