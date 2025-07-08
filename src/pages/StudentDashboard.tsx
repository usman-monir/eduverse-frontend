import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSessions, getStudyMaterials } from '@/services/api';
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
import { Calendar, Clock, User, FileText, Book } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const nextClass = sessions.find(
    (session) => session.status === 'booked' && session.studentId === user?.id
  );

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sessionsRes, materialsRes] = await Promise.all([
          getSessions(),
          getStudyMaterials(),
        ]);
        setSessions(sessionsRes.data.data || []);
        setStudyMaterials(materialsRes.data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <span className='text-lg'>Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-red-500'>Error loading dashboard: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white'>
          <h1 className='text-3xl font-bold mb-2'>
            Welcome back, {user?.name}!
          </h1>
          <p className='text-blue-100'>
            Ready to continue your learning journey? You have{' '}
            {studyMaterials.length} study materials available.
          </p>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Study Materials
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{studyMaterials.length}</div>
              <p className='text-xs text-muted-foreground'>
                Available resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Next Class</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {nextClass ? 'Today' : 'None'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {nextClass
                  ? `${nextClass.time} - ${nextClass.subject}`
                  : 'No upcoming classes'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Sessions Booked
              </CardTitle>
              <User className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {sessions.filter((s) => s.status === 'booked').length}
              </div>
              <p className='text-xs text-muted-foreground'>This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Class Section */}
        {nextClass && (
          <Card className='border-orange-200 bg-orange-50'>
            <CardHeader>
              <CardTitle className='text-orange-800'>Upcoming Class</CardTitle>
              <CardDescription className='text-orange-600'>
                Your next scheduled session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-semibold text-lg'>{nextClass.subject}</h3>
                  <p className='text-gray-600'>
                    with{' '}
                    {typeof nextClass.tutor === 'string'
                      ? nextClass.tutor
                      : (nextClass.tutor as any)?.name}
                  </p>
                  <div className='flex items-center space-x-4 mt-2 text-sm text-gray-500'>
                    <span>📅 {nextClass.date}</span>
                    <span>🕐 {nextClass.time}</span>
                    <span>⏰ {nextClass.duration}</span>
                  </div>
                </div>
                <Button>Join Class</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study Materials */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold'>Study Materials</h2>
            <Link to='/study-materials'>
              <Button variant='outline'>View All Materials</Button>
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {studyMaterials.map((material) => (
              <Card
                key={material.id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg'>{material.title}</CardTitle>
                    <Badge variant='secondary'>
                      {material.fileType.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className='text-sm'>
                    {material.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='text-sm text-gray-600'>
                      <p>📚 {material.subject}</p>
                      <p>👨‍🏫 {material.uploadedBy}</p>
                      <p>📅 {material.uploadedAt}</p>
                    </div>

                    <Button className='w-full' disabled>
                      View Material
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Link to='/book-class'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardContent className='p-6 text-center'>
                <Calendar className='h-12 w-12 mx-auto mb-4 text-blue-600' />
                <h3 className='font-semibold'>Book a Class</h3>
                <p className='text-sm text-gray-600 mt-2'>
                  Schedule a session with your tutor
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to='/messages'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardContent className='p-6 text-center'>
                <User className='h-12 w-12 mx-auto mb-4 text-green-600' />
                <h3 className='font-semibold'>Messages</h3>
                <p className='text-sm text-gray-600 mt-2'>
                  Chat with tutors and get support
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to='/study-materials'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardContent className='p-6 text-center'>
                <Book className='h-12 w-12 mx-auto mb-4 text-purple-600' />
                <h3 className='font-semibold'>Study Materials</h3>
                <p className='text-sm text-gray-600 mt-2'>
                  Access your learning resources
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
