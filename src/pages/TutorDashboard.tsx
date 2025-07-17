import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionManager } from "@/hooks/useSessionManager";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
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
  Plus,
  CalendarDays,
  Save,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { ClassSession } from "@/types";
import SessionForm from "@/components/SessionForm";

// Available Slot interface
interface AvailableSlot {
  _id?: string;
  date: string;
  time: string;
  duration: string;
  status: "available" | "booked" | "cancelled";
}

// Slot form interface
interface SlotFormData {
  date: string;
  time: string;
  duration: string;
}

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
  const [activeTab, setActiveTab] = useState("all-sessions");

  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailableSlot | null>(null);
  const [slotFormData, setSlotFormData] = useState<SlotFormData>({
    date: "",
    time: "",
    duration: "60",
  });

  const today = new Date().toISOString().split("T")[0];

  // Fetch available slots
  const fetchAvailableSlots = async () => {
    if (!user?._id) return;

    setSlotsLoading(true);
    try {
      const response = await fetch(`http://localhost:5050/api/tutors/my`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.existingSessions);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [user?._id]);

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
    (session) => session.type === "slot_request" && isTutorMatch(session)
  );

  const allSessions = sessions.filter(
    (session) => isTutorMatch(session) && session.type !== "slot_request"
  );

  const myCreatedSessions = sessions.filter(
    (session) => isCreator(session) && session.type !== "slot_request"
  );

  const todaySessions = allSessions.filter(
    (session) => session.status === "booked" && session.date === today
  );

  const upcomingSessions = allSessions.filter(
    (session) => session.status === "booked" && session.date > today
  );

  const completedSessions = allSessions.filter(
    (session) => session.status === "completed"
  );

  const handleCreateSession = async (sessionData: any) => {
    await addSession(sessionData);
    setShowCreate(false);
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
    month: "short", // "Dec"
    day: "2-digit", // "12"
    year: "numeric", // "2025"
  });
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

  const canEditOrDelete = (session: any) => {
    return (
      user?.role === "admin" ||
      session.createdBy?.toString() === user?._id?.toString() ||
      session.createdBy === user?._id
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <span className="text-lg">Loading sessions...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-green-100">
            Ready to teach today? You have {todaySessions.length} sessions
            scheduled.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Sessions scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Sessions
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total booked sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Sessions completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Session Dialog */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Create New Session</h2>
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Edit Session</h2>
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
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="all-sessions">
              Your Sessions ({allSessions.length})
            </TabsTrigger>
            {/* <TabsTrigger value="my-sessions">
              My Created ({myCreatedSessions.length})
            </TabsTrigger> */}
            {/* <TabsTrigger value="slot-requests">
              Slot Requests ({slotRequests.length})
            </TabsTrigger> */}
            {/* <TabsTrigger value="manage-slots">
              Manage Slots ({availableSlots.length})
            </TabsTrigger> */}
          </TabsList>

          {/* All Sessions Tab */}
          <TabsContent value="all-sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Sessions</CardTitle>
                <CardDescription>
                  Your scheduled classes for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaySessions.length > 0 ? (
                    todaySessions.map((session) => (
                      <div
                        key={session._id || session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <h3 className="font-semibold">{session.subject}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                           <span>🕐 {formatTime(session.time)}</span>

                            <span>⏰ {session.duration}</span>
                            {session.students?.length > 0 && (
                              <div className="text-sm text-blue-600">
                                👨‍🎓 Students: {session.students[0].studentName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(session.status)}
                          {session.meetingLink ? (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm">Start Session</Button>
                            </a>
                          ) : (
                            <Button size="sm" disabled>
                              No Link
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
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
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold">{session.subject}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                         <span>📅 {formatDate(session.date)}</span>

                          <span>🕐 {formatTime(session.time)}</span>
                          <span>⏰ {session.duration}</span>
                          {session.students?.length > 0 && (
                            <div className="text-sm text-blue-600">
                              👨‍🎓 Students: {session.students.length}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(session.status)}
                        {canEditOrDelete(session) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditSession(session)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
          {/* <TabsContent value="my-sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Created Sessions</CardTitle>
                <CardDescription>Sessions you have created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myCreatedSessions.length > 0 ? (
                    myCreatedSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <h3 className="font-semibold">{session.subject}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>⏰ {session.duration}</span>
                            {session.students?.length > 0 && (
                              <div className="text-sm text-blue-600">
                                👨‍🎓 Students: {session.students.length}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(session.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditSession(session)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      You haven't created any sessions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Slot Requests Tab */}
          {/* <TabsContent value="slot-requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Slot Requests</CardTitle>
                <CardDescription>
                  Student requests for your time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slotRequests.length > 0 ? (
                    slotRequests.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(session.status)}
                            <h3 className="font-semibold">{session.subject}</h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>⏰ {session.duration}</span>
                            {session.students?.length > 0 && (
                              <div className="text-sm text-blue-600">
                                👨‍🎓 Students: {session.students.length}
                              </div>
                            )}
                          </div>
                          {session.description && (
                            <p className="text-sm text-gray-500">
                              📝 {session.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(session.status)}
                          {session.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() =>
                                  approveSlotRequest(session.id, true)
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
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
                    <p className="text-gray-500 text-center py-8">
                      No slot requests at the moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Manage Slots Tab */}
          {/* <TabsContent value="manage-slots" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manage Available Slots</CardTitle>
                    <CardDescription>
                      Create and manage your available time slots for students
                      to book
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddSlot(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {slotsLoading ? (
                  <div className="text-center py-8">
                    <span className="text-gray-500">Loading slots...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <div
                          key={slot._id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>📅 {slot.date}</span>
                              <span>🕐 {slot.time}</span>
                              <span>⏰ {slot.duration} min</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(slot.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingSlot(slot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                slot._id && handleDeleteSlot(slot._id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No available slots created yet. Add your first slot to
                        get started!
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>

        {/* Add Slot Dialog */}
        {showAddSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Add New Slot</h2>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={slotFormData.date}
                    onChange={(e) =>
                      setSlotFormData({ ...slotFormData, date: e.target.value })
                    }
                    required
                    min={today}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={slotFormData.time}
                    onChange={(e) =>
                      setSlotFormData({ ...slotFormData, time: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={slotFormData.duration}
                    onValueChange={(value) =>
                      setSlotFormData({ ...slotFormData, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Add Slot
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Slot Dialog */}
        {editingSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Edit Slot</h2>
              <form onSubmit={handleUpdateSlot} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={slotFormData.date}
                    onChange={(e) =>
                      setSlotFormData({ ...slotFormData, date: e.target.value })
                    }
                    required
                    min={today}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={slotFormData.time}
                    onChange={(e) =>
                      setSlotFormData({ ...slotFormData, time: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Select
                    value={slotFormData.duration}
                    onValueChange={(value) =>
                      setSlotFormData({ ...slotFormData, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Update Slot
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TutorDashboard;
