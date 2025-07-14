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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ClassSession } from '@/types';
import SessionForm from '@/components/SessionForm';

const TutorDashboard = () => {
  const { user } = useAuth();
  const {
    sessions,
    loading,
    error,
    addSession,
    updateSession,
    deleteSession,
    approveSlotRequest,
  } = useSessionManager();
  const [showCreate, setShowCreate] = useState(false);
  const [editSession, setEditSession] = useState<ClassSession | null>(null);
  const [activeTab, setActiveTab] = useState('all-sessions');

  const today = new Date().toISOString().split('T')[0];

  const isTutorMatch = (session: any) => {
    // Prefer matching by user id if available, fallback to name
    if (user?._id && session.tutorId) return session.tutorId === user._id;
    return session.tutor === user?.name;
  };

  const isCreator = (session: any) => {
    return (
      session.createdBy?.toString() === user?._id?.toString() ||
      session.createdBy === user?._id
    );
  };

  // Filter sessions by different criteria
  const slotRequests = sessions.filter(
    (session) => session.type === 'slot_request' && isTutorMatch(session)
  );

  const allSessions = sessions.filter(
    (session) => isTutorMatch(session) && session.type !== 'slot_request'
  );

  const myCreatedSessions = sessions.filter(
    (session) => isCreator(session) && session.type !== 'slot_request'
  );

  const todaySessions = allSessions.filter(
    (session) => session.status === 'booked' && session.date === today
  );

  const upcomingSessions = allSessions.filter(
    (session) => session.status === 'booked' && session.date > today
  );

  const completedSessions = allSessions.filter(
    (session) => session.status === 'completed'
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

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className='bg-green-100 text-green-800'>Available</Badge>;
      case 'booked':
        return <Badge className='bg-blue-100 text-blue-800'>Booked</Badge>;
      case 'completed':
        return <Badge className='bg-gray-100 text-gray-800'>Completed</Badge>;
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'approved':
        return <Badge className='bg-green-100 text-green-800'>Approved</Badge>;
      case 'cancelled':
        return <Badge className='bg-red-100 text-red-800'>Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className='h-5 w-5 text-yellow-600' />;
      case 'approved':
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      case 'cancelled':
        return <XCircle className='h-5 w-5 text-red-600' />;
      case 'booked':
        return <Calendar className='h-5 w-5 text-blue-600' />;
      case 'completed':
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      default:
        return <Calendar className='h-5 w-5 text-gray-600' />;
    }
  };

  const canEditOrDelete = (session: any) => {
    return (
      user?.role === 'admin' ||
      session.createdBy?.toString() === user?._id?.toString() ||
      session.createdBy === user?._id
    );
  };

  // Add type and creator badges
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'admin_created':
        return <Badge className='bg-purple-100 text-purple-800'>Admin Created</Badge>;
      case 'tutor_created':
        return <Badge className='bg-blue-100 text-blue-800'>Tutor Created</Badge>;
      case 'slot_request':
        return <Badge className='bg-orange-100 text-orange-800'>Slot Request</Badge>;
      default:
        return null;
    }
  };

  const getCreatorBadge = (session: any) => {
    if (session.createdBy === user?._id || session.createdBy === user?.id) {
      return <Badge className='bg-blue-100 text-blue-800'>You</Badge>;
    }
    if (session.createdByName) {
      return <Badge className='bg-gray-100 text-gray-800'>{session.createdByName}</Badge>;
    }
    return null;
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
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
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

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Slot Requests
              </CardTitle>
              <AlertCircle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{slotRequests.length}</div>
              <p className='text-xs text-muted-foreground'>Pending requests</p>
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
                defaultTutor={user?.name}
                isTutor={true}
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
                isTutor={true}
              />
            </div>
          </div>
        )}

        {/* Tabs for Session Management */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='all-sessions'>
              All Sessions ({allSessions.length})
            </TabsTrigger>
            <TabsTrigger value='my-sessions'>
              My Created ({myCreatedSessions.length})
            </TabsTrigger>
            <TabsTrigger value='slot-requests'>
              Slot Requests ({slotRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* All Sessions Tab */}
          <TabsContent value='all-sessions' className='space-y-6'>
            {/* All My Sessions Card */}
            <Card>
              <CardHeader>
                <CardTitle>All My Sessions</CardTitle>
                <CardDescription>
                  Every session you are the tutor for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {allSessions.length > 0 ? (
                    allSessions.map((session) => (
                      <div
                        key={session.id}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='space-y-1'>
                          <h3 className='font-semibold'>{session.subject}</h3>
                          <div className='flex items-center space-x-4 text-sm text-gray-600'>
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>⏰ {session.duration}</span>
                            <span>Status: {getStatusBadge(session.status)}</span>
                            {getTypeBadge(session.type)}
                            {getCreatorBadge(session)}
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {canEditOrDelete(session) && (
                            <>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setEditSession(session)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-500 text-center py-8'>
                      You have no sessions as tutor yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* End All My Sessions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Sessions</CardTitle>
                <CardDescription>
                  Your scheduled classes for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {todaySessions.length > 0 ? (
                    todaySessions.map((session) => (
                      <div
                        key={session.id}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='space-y-1'>
                          <h3 className='font-semibold'>{session.subject}</h3>
                          <div className='flex items-center space-x-4 text-sm text-gray-600'>
                            <span>🕐 {session.time}</span>
                            <span>⏰ {session.duration}</span>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getStatusBadge(session.status)}
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

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>All your booked sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {upcomingSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='space-y-1'>
                        <h3 className='font-semibold'>{session.subject}</h3>
                        <div className='flex items-center space-x-4 text-sm text-gray-600'>
                          <span>📅 {session.date}</span>
                          <span>🕐 {session.time}</span>
                          <span>⏰ {session.duration}</span>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {getStatusBadge(session.status)}
                        {canEditOrDelete(session) && (
                          <>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setEditSession(session)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Created Sessions Tab */}
          <TabsContent value='my-sessions' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>My Created Sessions</CardTitle>
                <CardDescription>Sessions you have created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {myCreatedSessions.length > 0 ? (
                    myCreatedSessions.map((session) => (
                      <div
                        key={session.id}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='space-y-1'>
                          <h3 className='font-semibold'>{session.subject}</h3>
                          <div className='flex items-center space-x-4 text-sm text-gray-600'>
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>⏰ {session.duration}</span>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getStatusBadge(session.status)}
                          <Link to={`/session/${session.id}`}>
                            <Button variant='outline' size='sm'>
                              View Details
                            </Button>
                          </Link>
                          {canEditOrDelete(session) && (
                            <>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setEditSession(session)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-500 text-center py-8'>
                      You haven't created any sessions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slot Requests Tab */}
          <TabsContent value='slot-requests' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Slot Requests</CardTitle>
                <CardDescription>
                  Student requests for your time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {slotRequests.length > 0 ? (
                    slotRequests.map((session) => (
                      <div
                        key={session.id}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='space-y-1'>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(session.status)}
                            <h3 className='font-semibold'>{session.subject}</h3>
                          </div>
                          <div className='flex items-center space-x-4 text-sm text-gray-600'>
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>⏰ {session.duration}</span>
                          </div>
                          {session.description && (
                            <p className='text-sm text-gray-500'>
                              📝 {session.description}
                            </p>
                          )}
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getStatusBadge(session.status)}
                          {session.status === 'pending' && (
                            <div className='flex space-x-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-green-600 hover:text-green-700'
                                onClick={() =>
                                  approveSlotRequest(session.id, true)
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-red-600 hover:text-red-700'
                                onClick={() =>
                                  approveSlotRequest(session.id, false)
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-500 text-center py-8'>
                      No slot requests at the moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TutorDashboard;
