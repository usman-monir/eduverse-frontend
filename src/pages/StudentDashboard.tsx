import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSessions, getStudyMaterials } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Book,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import DashboardLayout from "@/components/Layout/DashboardLayout";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const nextClass = sessions.find((session) => {
    const sessionStudentId =
      session.studentId?.toString?.() ||
      session.students?.[0]?.studentId?.toString?.();

    const userId = user?._id?.toString?.() || user?.id?.toString?.();

    return (
      (session.status === "booked" || session.status === "approved") &&
      sessionStudentId === userId
    );
  });

  // Filter sessions for different views
  const myBookedSessions = sessions.filter((session) => {
    const sessionStudentId =
      session.studentId?.toString?.() ||
      session.students?.[0]?.studentId?.toString?.();

    const userId =
      user?._id?.toString?.() ||
      user?.id?.toString?.() ||
      user?._id ||
      user?.id;

    const isBookedByUser =
      session.status === "booked" || session.status === "approved";

    const isMyBooking = sessionStudentId === userId;

    return isBookedByUser && isMyBooking;
  });

  const mySlotRequests = sessions.filter((session) => {
    const sessionCreatedBy =
      session.createdBy?.toString?.() || session.createdBy;
    const userId =
      user?._id?.toString?.() ||
      user?.id?.toString?.() ||
      user?._id ||
      user?.id;
    const isMatch =
      session.type === "slot_request" && sessionCreatedBy === userId;

    // Debug logging
    if (session.type === "slot_request") {
      console.log("Slot request found:", {
        sessionId: session.id,
        sessionCreatedBy,
        userId,
        isMatch,
        sessionType: session.type,
        sessionStatus: session.status,
      });
    }

    return isMatch;
  });

  const completedSessions = sessions.filter((session) => {
    const sessionStudentId =
      session.studentId?.toString?.() || session.studentId;
    const userId =
      user?._id?.toString?.() ||
      user?.id?.toString?.() ||
      user?._id ||
      user?.id;
    return session.status === "completed" && sessionStudentId === userId;
  });

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sessionsRes, materialsRes] = await Promise.all([
          getSessions(),
          getStudyMaterials(),
        ]);
        const sessionsData = sessionsRes.data.data || [];
        setSessions(sessionsData);
        setStudyMaterials(materialsRes.data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "booked":
        return <Badge className="bg-blue-100 text-blue-800">Booked</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "booked":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error loading dashboard: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-blue-100">
            Ready to continue your learning journey? You have{" "}
            {studyMaterials.length} study materials available.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Study Materials
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyMaterials.length}</div>
              <p className="text-xs text-muted-foreground">
                Available resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Booked Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myBookedSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Your scheduled classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Slot Requests
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mySlotRequests.length}</div>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">Finished classes</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Class Section */}
        {nextClass && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Upcoming Class</CardTitle>
              <CardDescription className="text-orange-600">
                Your next scheduled session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{nextClass.subject}</h3>
                  <p className="text-gray-600">
                    with{" "}
                    {typeof nextClass.tutor === "string"
                      ? nextClass.tutorName
                      : (nextClass.tutor as any)?.name || "Unknown Tutor"}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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

        {/* Tabs for Session Management */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>

            <TabsTrigger value="slot-requests">
              My Requests ({mySlotRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Study Materials */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Study Materials</h2>
                <Link to="/study-materials">
                  <Button variant="outline">View All Materials</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studyMaterials.slice(0, 6).map((material) => (
                  <Card
                    key={material.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {material.title}
                        </CardTitle>
                        <Badge variant="secondary">
                          {material.fileType.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {material.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          <p>📚 {material.subject}</p>
                          <p>
                            👨‍🏫 Uploaded by:{" "}
                            {material.uploadedBy?.name ||
                              material.uploadedByName ||
                              "-"}
                          </p>
                          <p>📅 {material.uploadedAt}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Slot Requests Tab */}
          <TabsContent value="slot-requests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Slot Requests</CardTitle>
                    <CardDescription>
                      Your requests for time slots
                    </CardDescription>
                  </div>
                  <Link to="/request-slot">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mySlotRequests.length > 0 ? (
                    mySlotRequests.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(session.status)}
                            <h3 className="font-semibold">{session.subject}</h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              👨‍🏫{" "}
                              {typeof session.tutor === "string"
                                ? session.tutor
                                : session.tutorName ||
                                  (session.tutor as any)?.name ||
                                  "Unknown Tutor"}
                            </span>
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>⏰ {session.duration}</span>
                          </div>
                          {session.description && (
                            <p className="text-sm text-gray-500">
                              📝 {session.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        You haven't made any slot requests yet.
                      </p>
                      <Link to="/request-slot">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Request a Slot
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Sessions Tab */}
          <TabsContent value="available" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Sessions</CardTitle>
                    <CardDescription>
                      Book your preferred time slots
                    </CardDescription>
                  </div>
                  <Link to="/book-class">
                    <Button>
                      <Book className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
