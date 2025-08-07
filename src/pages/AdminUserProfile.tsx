import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminUserById, getSessions } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Loader2, ArrowLeft } from 'lucide-react';

const AdminUserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user details
        const userRes = await getAdminUserById(id);
        const userData = userRes.data.data;
        setUser(userData);
        // Fetch sessions for this user (as student or tutor)
        let sessionsRes;
        if (userData.role === 'tutor') {
          sessionsRes = await getSessions({ tutorId: id, limit: 1000 });
        } else if (userData.role === 'student') {
          sessionsRes = await getSessions({ studentId: id, limit: 1000 });
        } else {
          sessionsRes = { data: { data: [] } };
        }
        setSessions(sessionsRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserAndSessions();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Loading profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-red-500'>Error loading profile: {error || 'User not found'}</p>
          <Button onClick={() => navigate('/admin/users')} className='mt-4'>
            <ArrowLeft className='h-4 w-4 mr-2' /> Back to Users
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Filter sessions by status
  const bookedSessions = sessions.filter(s => s.status === 'booked');
  const availableSessions = sessions.filter(s => s.status === 'available');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <Button variant='outline' onClick={() => navigate('/admin/users')}>
          <ArrowLeft className='h-4 w-4 mr-2' /> Back to Users
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.role === 'tutor' ? 'Tutor Profile' : 'Student Profile'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col md:flex-row md:items-center md:space-x-8'>
              <div className='mb-4 md:mb-0'>
                <Badge variant='outline' className='capitalize'>{user.role}</Badge>
                <div className='text-gray-600 mt-2'>
                  <div><span className='font-medium'>Email:</span> {user.email}</div>
                  {user.phone && <div><span className='font-medium'>Phone:</span> {user.phone}</div>}
                  <div><span className='font-medium'>Status:</span> {user.status}</div>
                  <div><span className='font-medium'>Joined:</span> {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : ''}</div>
                </div>
              </div>
              <div className='flex-1 grid grid-cols-2 gap-4'>
                {user.role === 'tutor' && user.subjects && (
                  <div className='col-span-2 text-center p-2 bg-purple-50 rounded'>
                    <div className='font-semibold text-purple-600'>Subjects: {user.subjects.join(', ')}</div>
                  </div>
                )}
                {user.role === 'tutor' && user.experience && (
                  <div className='col-span-2 text-center p-2 bg-yellow-50 rounded'>
                    <div className='font-semibold text-yellow-600'>Experience: {user.experience}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>All sessions for this {user.role}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h4 className='font-semibold mb-2'>Booked Sessions</h4>
                {bookedSessions.length === 0 ? (
                  <div className='text-gray-500 text-sm'>No booked sessions.</div>
                ) : (
                  <ul className='space-y-2'>
                    {bookedSessions.map(session => (
                      <li key={session._id} className='p-2 border rounded'>
                        <div className='font-medium'>{session.subject}</div>
                        <div className='text-xs text-gray-500'>
                          {session.date} at {session.time}
                        </div>
                        <div className='text-xs'>Tutor: {session.tutorName}</div>
                        {session.meetingLink && <div className='text-xs'>Link: {session.meetingLink}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className='font-semibold mb-2'>Available Sessions</h4>
                {availableSessions.length === 0 ? (
                  <div className='text-gray-500 text-sm'>No available sessions.</div>
                ) : (
                  <ul className='space-y-2'>
                    {availableSessions.map(session => (
                      <li key={session._id} className='p-2 border rounded'>
                        <div className='font-medium'>{session.subject}</div>
                        <div className='text-xs text-gray-500'>
                          {session.date} at {session.time}
                        </div>
                        <div className='text-xs'>Tutor: {session.tutorName}</div>
                        {session.meetingLink && <div className='text-xs'>Link: {session.meetingLink}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className='mt-6'>
              <h4 className='font-semibold mb-2'>Completed Sessions</h4>
              {completedSessions.length === 0 ? (
                <div className='text-gray-500 text-sm'>No completed sessions.</div>
              ) : (
                <ul className='space-y-2'>
                  {completedSessions.map(session => (
                    <li key={session._id} className='p-2 border rounded'>
                      <div className='font-medium'>{session.subject}</div>
                      <div className='text-xs text-gray-500'>
                        {session.date} at {session.time}
                      </div>
                      <div className='text-xs'>Tutor: {session.tutorName}</div>
                      {session.meetingLink && <div className='text-xs'>Link: {session.meetingLink}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUserProfile; 