import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  ArrowLeft, 
  Video, 
  Mail, 
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';

interface EnrolledStudent {
  studentId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  studentName: string;
  enrolledAt: string;
}

interface SessionDetail {
  _id: string;
  subject: string;
  tutor: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  tutorName: string;
  date: string;
  time: string;
  duration: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled' | 'pending' | 'approved';
  enrolledStudents: EnrolledStudent[];
  enrollmentCount: number;
  meetingLink?: string;
  description?: string;
  price?: number;
  type: 'admin_created' | 'tutor_created' | 'slot_request';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const SessionDetail = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetail = async () => {
      if (!sessionId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await getSessionById(sessionId);
        setSession(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetail();
  }, [sessionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'booked':
        return <Badge className="bg-blue-100 text-blue-800">Booked</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-purple-100 text-purple-800">Approved</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'admin_created':
        return <Badge variant="outline">Admin Created</Badge>;
      case 'tutor_created':
        return <Badge variant="outline">Tutor Created</Badge>;
      case 'slot_request':
        return <Badge variant="outline">Slot Request</Badge>;
      default:
        return null;
    }
  };

  const canViewDetails = () => {
    if (!session || !user) return false;
    
    // Admins can view all sessions
    if (user.role === 'admin') return true;
    
    // Tutors can view their own sessions
    if (user.role === 'tutor' && session.tutor._id === user._id) return true;
    
    // Students can view sessions they're enrolled in
    if (user.role === 'student') {
      return session.enrolledStudents.some(enrollment => 
        enrollment.studentId._id === user._id
      );
    }
    
    return false;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading session details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
          <p className="text-gray-600 mb-4">
            {error || 'The session you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!canViewDetails()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            You do not have permission to view this session.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{session.subject}</h1>
              <p className="text-gray-600">Session Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(session.status)}
            {getTypeBadge(session.type)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Session Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p className="text-lg">{formatDate(session.date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Time</Label>
                    <p className="text-lg">{formatTime(session.time)} ({session.duration})</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tutor</Label>
                    <p className="text-lg">{session.tutor.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Price</Label>
                    <p className="text-lg">{session.price ? `$${session.price}` : 'Free'}</p>
                  </div>
                </div>
                
                {session.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-gray-700 mt-1">{session.description}</p>
                  </div>
                )}

                {session.meetingLink && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Meeting Link</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(session.meetingLink, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enrolled Students */}
            <Card>
              <CardContent>
                {session.enrolledStudents.length > 0 ? (
                  <div className="space-y-3">
                    {session.enrolledStudents.map((enrollment, index) => (
                      <div key={enrollment.studentId._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {enrollment.studentName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{enrollment.studentName}</p>
                            <p className="text-sm text-gray-600">{enrollment.studentId.email}</p>
                            <p className="text-xs text-gray-500">
                              Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {enrollment.studentId.phone && (
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No students enrolled yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tutor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Tutor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {session.tutor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.tutor.name}</p>
                    <p className="text-sm text-gray-600">{session.tutor.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {session.tutor.phone && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Session Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrollment</span>
                  <span className="font-medium">{session.enrollmentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">{session.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(session.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SessionDetail; 