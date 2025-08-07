import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  ArrowLeft,
  Target,
  Globe,
  GraduationCap,
  BookOpen,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getSmartQuadSessions, getMySmartQuads } from "@/services/api";

interface ClassSession {
  _id: string;
  id?: string;
  subject: string;
  tutor: string;
  tutorName: string;
  date: string;
  time: string;
  duration: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled' | 'pending' | 'approved';
  meetingLink?: string;
  description?: string;
  type: 'admin_created' | 'tutor_created' | 'slot_request' | 'smart_quad';
  students?: {
    studentId: string;
    studentName?: string;
  }[];
  smartQuadId?: string;
  sessionNumber?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SmartQuad {
  _id: string;
  name: string;
  description?: string;
  tutor: string;
  tutorName: string;
  students: {
    studentId: string;
    studentName: string;
    email: string;
    phone?: string;
  }[];
  maxStudents: number;
  currentStudents: number;
  status: 'forming' | 'active' | 'completed' | 'cancelled';
  courseType: 'one-on-one' | 'smart-quad';
  preferredLanguage: 'English' | 'Hindi' | 'Punjabi' | 'Nepali';
  desiredScore: number;
  examDeadline: string;
  courseDuration: number;
  totalSessions: number;
  completedSessions: number;
  courseExpiryDate: string;
  weeklySchedule: {
    day: string;
    time: string;
    duration: number;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const SmartQuadSessions = () => {
  const { smartQuadId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [smartQuad, setSmartQuad] = useState<SmartQuad | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "all">("upcoming");

  // Get smartQuadId from URL params or search params
  const currentSmartQuadId = smartQuadId || searchParams.get('smartQuadId');

  useEffect(() => {
    if (currentSmartQuadId) {
      fetchData();
    } else {
      // If no smartQuadId provided, redirect to dashboard or show error
      navigate('/student-dashboard');
    }
  }, [currentSmartQuadId]);

  const fetchData = async () => {
    if (!currentSmartQuadId) return;
    
    try {
      setLoading(true);
      
      // Fetch both Smart Quad details and sessions
      const [sessionsResponse, smartQuadsResponse] = await Promise.all([
        getSmartQuadSessions(currentSmartQuadId),
        getMySmartQuads() // Get all Smart Quads (admin endpoint) - will be filtered by backend based on user access
      ]);
      
      // Set sessions - based on your backend controller structure
      setSessions(sessionsResponse.data.data || []);
      
      // Set Smart Quad details from the sessions response (your backend returns smartQuad info)
      if (sessionsResponse.data.data?.smartQuad) {
        setSmartQuad(sessionsResponse.data.data.smartQuad);
      } else {
        // Fallback: find the specific Smart Quad from getSmartQuads response
        const smartQuads = smartQuadsResponse.data.data || [];
        const currentQuad = smartQuads.find((quad: any) => 
          (quad._id || quad.id) === currentSmartQuadId
        );
        if (currentQuad) {
          setSmartQuad(currentQuad);
        }
      }
      
    } catch (error: any) {
      console.error("Error fetching Smart Quad sessions:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch Smart Quad sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: string): string => {
    // Since duration is already a string like "60 minutes", just return it
    return duration || "";
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "booked":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "booked":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFilteredSessions = () => {
    switch (activeTab) {
      case "upcoming":
        return sessions.filter(session => 
          session.status === "booked" && new Date(session.date) >= new Date()
        );
      case "completed":
        return sessions.filter(session => session.status === "completed");
      case "all":
      default:
        return sessions;
    }
  };

  const filteredSessions = getFilteredSessions();

  const upcomingSessions = sessions.filter(session => 
    session.status === "booked" && new Date(session.date) >= new Date()
  );
  const completedSessions = sessions.filter(session => session.status === "completed");

  const SessionCard = ({ session }: { session: ClassSession }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(session.status)}
            <div>
              <CardTitle className="text-lg">
                Session #{session.sessionNumber || 'N/A'}
              </CardTitle>
              <CardDescription>
                {session.subject} with {session.tutorName}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(session.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(session.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime(session.time)} ({session.duration})
            </span>
          </div>
          {session.meetingLink && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Video className="h-4 w-4" />
              <span>Meeting link available</span>
            </div>
          )}
          {session.description && (
            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {session.description}
            </p>
          )}
          
          {/* Student list preview */}
          {session.students && session.students.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{session.students.length} students enrolled</span>
            </div>
          )}
        </div>

        {session.status === "booked" && session.meetingLink && (
          <div className="mt-4">
            <Button
              className="w-full"
              onClick={() => window.open(session.meetingLink, "_blank")}
            >
              <Video className="h-4 w-4 mr-2" />
              Join Class
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Smart Quad sessions...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!smartQuad) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Smart Quad Not Found</h3>
          <p className="text-gray-600 mb-4">The Smart Quad batch you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/student-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student-dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{smartQuad.name}</h1>
              <p className="text-gray-600">{smartQuad.description}</p>
            </div>
          </div>
        </div>

        {/* Smart Quad Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Smart Quad Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-blue-700 font-medium">Tutor</p>
                  <p className="text-blue-600">{smartQuad.tutorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-blue-700 font-medium">Language</p>
                  <p className="text-blue-600">{smartQuad.preferredLanguage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-blue-700 font-medium">Target Score</p>
                  <p className="text-blue-600">{smartQuad.desiredScore}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-blue-700 font-medium">Students</p>
                  <p className="text-blue-600">{smartQuad.currentStudents}/{smartQuad.maxStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-blue-700 font-medium">📅 Exam Deadline</p>
                <p className="text-blue-600">{new Date(smartQuad.examDeadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">⏰ Course Expires</p>
                <p className="text-blue-600">{new Date(smartQuad.courseExpiryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">📚 Progress</p>
                <p className="text-blue-600">{smartQuad.completedSessions || 0}/{smartQuad.totalSessions} sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {upcomingSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">Classes ahead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">Sessions done</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {smartQuad.totalSessions > 0 ? Math.round(((smartQuad.completedSessions || 0) / smartQuad.totalSessions) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Course completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "upcoming" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("upcoming")}
            className="flex-1"
          >
            Upcoming ({upcomingSessions.length})
          </Button>
          <Button
            variant={activeTab === "completed" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("completed")}
            className="flex-1"
          >
            Completed ({completedSessions.length})
          </Button>
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="flex-1"
          >
            All Sessions ({sessions.length})
          </Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length > 0 ? (
            filteredSessions
              .sort((a, b) => {
                // Sort by session number first, then by date
                if (a.sessionNumber && b.sessionNumber) {
                  return a.sessionNumber - b.sessionNumber;
                }
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              })
              .map((session) => (
                <SessionCard key={session._id || session.id} session={session} />
              ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  {activeTab === "upcoming" && (
                    <>
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">
                        No upcoming sessions
                      </h3>
                      <p>All your Smart Quad sessions are completed or there are no sessions scheduled yet.</p>
                    </>
                  )}
                  {activeTab === "completed" && (
                    <>
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">
                        No completed sessions
                      </h3>
                      <p>You haven't completed any Smart Quad sessions yet.</p>
                    </>
                  )}
                  {activeTab === "all" && (
                    <>
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">
                        No sessions found
                      </h3>
                      <p>No sessions have been created for this Smart Quad batch yet.</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartQuadSessions;