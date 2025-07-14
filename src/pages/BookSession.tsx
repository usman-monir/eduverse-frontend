import React, { useState } from 'react';
import { getSessions, bookSession } from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookSession = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState('all');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subjects = [...new Set(sessions.map((session) => session.subject))];
  const tutors = [...new Set(sessions.map((session) => session.tutorName || session.tutor))];

  // Create a map of dates with available sessions
  const sessionsByDate = sessions.reduce((acc, session) => {
    if (session.status === 'available') {
      const dateKey = new Date(session.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
    }
    return acc;
  }, {} as Record<string, any[]>);

  // Get dates with available sessions for calendar highlighting
  const datesWithSessions = Object.keys(sessionsByDate).map(dateStr => new Date(dateStr));

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    const matchesDate =
      !selectedDate ||
      sessionDate.toDateString() === selectedDate.toDateString();
    const matchesSubject =
      selectedSubject === 'all' || session.subject === selectedSubject;
    const matchesTutor =
      selectedTutor === 'all' || (session.tutorName || session.tutor) === selectedTutor;
    return (
      matchesDate &&
      matchesSubject &&
      matchesTutor &&
      session.status === 'available'
    );
  });

  const handleBookSession = async (sessionId: string) => {
    try {
      console.log('Booking session with ID:', sessionId); // Debug log
      if (!sessionId || sessionId === 'undefined') {
        throw new Error('Invalid session ID');
      }
      await bookSession(sessionId, {});
      toast({
        title: 'Class booked successfully!',
        description: 'You will receive a confirmation email shortly.',
      });
      // Optionally, refetch sessions to update status
      fetchSessions();
    } catch (err: any) {
      console.error('Booking error:', err); // Debug log
      toast({
        title: 'Booking failed',
        description:
          err.response?.data?.message || err.message || 'Could not book the session.',
        variant: 'destructive',
      });
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSessions();
      setSessions(res.data.data || []); // rely on useSessionManager for normalization
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, []);

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

  // Custom calendar day renderer to show session counts
  const renderDay = (day: Date) => {
    const dateKey = day.toDateString();
    const sessionsForDay = sessionsByDate[dateKey] || [];
    const sessionCount = sessionsForDay.length;

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {sessionCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <Badge className="bg-green-500 text-white text-xs px-1 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
              {sessionCount}
            </Badge>
          </div>
        )}
      </div>
    );
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
          <p className='text-red-500'>Error loading sessions: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Book a Session</h1>
            <p className='text-gray-600'>
              Schedule one-on-one sessions with your tutors
            </p>
          </div>

          <Link to='/request-slot'>
            <Button
              size='lg'
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            >
              <Plus className='h-5 w-5 mr-2' />
              Request Custom Slot
            </Button>
          </Link>
        </div>

        {/* Session Summary */}
        <Card className='bg-green-50 border-green-200'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-green-800 mb-1'>
                  📅 Available Sessions Overview
                </h3>
                <p className='text-green-700 text-sm'>
                  {datesWithSessions.length} days with available sessions • {sessions.filter(s => s.status === 'available').length} total sessions
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='flex items-center space-x-1'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-green-700'>Available</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <Badge className='bg-green-500 text-white text-xs px-1 py-0.5'>3</Badge>
                  <span className='text-sm text-green-700'>Session count</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='bg-blue-50 border-blue-200'>
            <CardContent className='p-4'>
              <h3 className='font-semibold text-blue-800 mb-2'>
                📅 Available Sessions
              </h3>
              <p className='text-blue-700 text-sm'>
                Book from pre-scheduled available time slots
              </p>
            </CardContent>
          </Card>

          <Card className='bg-purple-50 border-purple-200'>
            <CardContent className='p-4'>
              <h3 className='font-semibold text-purple-800 mb-2'>
                ⏰ Request Custom Slot
              </h3>
              <p className='text-purple-700 text-sm'>
                Request your preferred time with your chosen tutor
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Calendar and Filters */}
          <div className='lg:col-span-1 space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <CalendarIcon className='h-5 w-5' />
                  <span>Select Date</span>
                </CardTitle>
                <CardDescription>
                  Dates with green dots have available sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode='single'
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className='rounded-md border'
                  modifiers={{
                    hasSessions: datesWithSessions,
                  }}
                  modifiersStyles={{
                    hasSessions: {
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      fontWeight: 'bold',
                    },
                  }}
                />
                
                {/* Session summary for selected date */}
                {selectedDate && sessionsByDate[selectedDate.toDateString()] && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">
                        {sessionsByDate[selectedDate.toDateString()].length} session(s)
                      </span> available on {selectedDate.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Subject
                  </label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Tutor
                  </label>
                  <Select
                    value={selectedTutor}
                    onValueChange={setSelectedTutor}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Tutors</SelectItem>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor} value={tutor}>
                          {tutor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Sessions */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle>Available Sessions</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Sessions for ${selectedDate.toDateString()}`
                    : 'Select a date to view available sessions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredSessions.length > 0 ? (
                  <div className='space-y-4'>
                    {filteredSessions.map((session) => {
                      console.log('Session object:', session); // Debug log
                      const sessionId = session.id || session._id;
                      console.log('Session ID:', sessionId); // Debug log
                      
                      return (
                      <div
                          key={sessionId}
                        className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='space-y-2'>
                            <h3 className='font-semibold text-lg'>
                              {session.subject}
                            </h3>
                            <div className='flex items-center space-x-4 text-sm text-gray-600'>
                              <span className='flex items-center space-x-1'>
                                <User className='h-4 w-4' />
                                <span>{session.tutorName || session.tutor}</span>
                              </span>
                              <span className='flex items-center space-x-1'>
                                <Clock className='h-4 w-4' />
                                <span>{session.time}</span>
                              </span>
                              <span>📅 {session.date}</span>
                              <span>⏰ {session.duration}</span>
                            </div>
                            <div>{getStatusBadge(session.status)}</div>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button>Book Session</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Booking</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to book this session?
                                </DialogDescription>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
                                  <h4 className='font-semibold'>
                                    {session.subject}
                                  </h4>
                                  <p className='text-sm text-gray-600'>
                                    Tutor: {session.tutorName || session.tutor}
                                  </p>
                                  <p className='text-sm text-gray-600'>
                                    Date: {session.date}
                                  </p>
                                  <p className='text-sm text-gray-600'>
                                    Time: {session.time}
                                  </p>
                                  <p className='text-sm text-gray-600'>
                                    Duration: {session.duration}
                                  </p>
                                </div>
                                <div className='flex space-x-2'>
                                  <Button
                                    className='flex-1'
                                    onClick={() => handleBookSession(sessionId)}
                                  >
                                    Confirm Booking
                                  </Button>
                                  <Button variant='outline' className='flex-1'>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <CalendarIcon className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                    <p className='text-gray-500'>
                      No available sessions for the selected criteria.
                    </p>
                    <p className='text-sm text-gray-400 mt-2'>
                      Try selecting a different date or adjusting your filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Guidelines */}
        <Card className='bg-blue-50 border-blue-200'>
          <CardHeader>
            <CardTitle className='text-blue-800'>Booking Options</CardTitle>
          </CardHeader>
          <CardContent className='text-blue-700'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-2'>📅 Available Sessions</h4>
                <ul className='space-y-1 text-sm'>
                  <li>• Book instantly from available slots</li>
                  <li>• Immediate confirmation</li>
                  <li>• Fixed schedule options</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2'>⏰ Custom Slot Requests</h4>
                <ul className='space-y-1 text-sm'>
                  <li>• Choose your preferred time & tutor</li>
                  <li>• Subject to admin approval</li>
                  <li>• Flexible scheduling options</li>
                  <li>• Email confirmation after approval</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookSession;
