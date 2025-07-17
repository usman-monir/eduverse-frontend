import React, { useState, useEffect } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { CalendarDays } from "lucide-react";
import { ClassSession } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import SessionForm from "@/components/SessionForm";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
interface AvailableSlot {
  _id?: string;
  date: string;
  time: string;
  duration: string;
  status: "available" | "booked" | "cancelled";
}
const TutorSession = () => {
  const {
    sessions,
    loading,
    error,
    addSession,
    updateSession,
    deleteSession,
    approveSlotRequest,
  } = useSessionManager();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null
  );
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Filter sessions based on user role and current tab
  const getFilteredSessions = () => {
    let filtered = sessions;

    // Role-based filtering
    if (user?.role === "tutor") {
      // Tutors see their sessions and slot requests for them
      filtered = sessions.filter((session) => {
        const isTutorMatch =
          session.tutorId?.toString() === user._id?.toString() ||
          session.tutorId === user._id ||
          session.tutor === user.name;
        const isCreator =
          session.createdBy?.toString() === user._id?.toString() ||
          session.createdBy === user._id;
        return isTutorMatch || isCreator;
      });
    }

    // Tab-based filtering
    if (activeTab === "my-created") {
      filtered = filtered.filter(
        (session) =>
          session.createdBy?.toString() === user?._id?.toString() ||
          session.createdBy === user?._id
      );
    } else if (activeTab === "slot-requests") {
      filtered = filtered.filter((session) => session.type === "slot_request");
    }

    // Status and type filtering
    if (filterStatus !== "all") {
      filtered = filtered.filter((session) => session.status === filterStatus);
    }
    if (filterType !== "all") {
      filtered = filtered.filter((session) => session.type === filterType);
    }

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.students?.some(
            (s) =>
              s.studentId.toString().includes(searchTerm.toLowerCase()) ||
              s.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short", // "Dec"
      day: "2-digit", // "12"
      year: "numeric", // "2025"
    });
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
  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Fetch available slots
  const fetchAvailableSlots = async () => {
    if (!user?._id) return;

    setSlotsLoading(true);
    try {
      const response = await fetch(
         `${import.meta.env.VITE_API_BASE_URL}/tutors/${user._id}/slots`
      );
      if (response.ok) {
        const slots = await response.json();
        setAvailableSlots(slots);
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

  const filteredSessions = getFilteredSessions();

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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "admin_created":
        return (
          <Badge className="bg-purple-100 text-purple-800">Admin Created</Badge>
        );
      case "tutor_created":
        return (
          <Badge className="bg-blue-100 text-blue-800">Tutor Created</Badge>
        );
      case "slot_request":
        return (
          <Badge className="bg-orange-100 text-orange-800">Slot Request</Badge>
        );
      default:
        return null;
    }
  };

  const handleAddSession = async (sessionData: Omit<ClassSession, "id">) => {
    await addSession(sessionData);
    setIsAddDialogOpen(false);
    toast({
      title: "Session Created",
      description: "New session has been created successfully.",
    });
  };

  const handleUpdateSession = async (sessionData: Omit<ClassSession, "id">) => {
    const sessionId = editingSession?.id || (editingSession as any)?._id;
    if (sessionId) {
      await updateSession(sessionId, sessionData);
      setEditingSession(null);
      toast({
        title: "Session Updated",
        description: "Session has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Session ID is missing.",
        variant: "destructive",
      });
    }
  };
  const isTutorMatch = (session: any) => {
    // Prefer matching by user id if available, fallback to name
    if (user?._id && session.tutorId) return session.tutorId === user._id;
    return session.tutor === user?.name;
  };
  const slotRequests = sessions.filter(
    (session) => session.type === "slot_request" && isTutorMatch(session)
  );

  const handleDeleteSession = async (id: string | undefined) => {
    const sessionId = id || (id as any)?._id;
    if (sessionId) {
      await deleteSession(sessionId);
      toast({
        title: "Session Deleted",
        description: "Session has been deleted successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Session ID is missing.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: "approve" | "reject" | "delete") => {
    if (selectedSessions.length === 0) {
      toast({
        title: "No sessions selected",
        description: "Please select sessions to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const sessionId of selectedSessions) {
        if (action === "delete") {
          await deleteSession(sessionId);
        } else {
          await approveSlotRequest(sessionId, action === "approve");
        }
      }

      setSelectedSessions([]);
      toast({
        title: "Bulk Action Completed",
        description: `${action}ed ${selectedSessions.length} session(s) successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action.",
        variant: "destructive",
      });
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
          <p className="text-red-500">Error loading sessions: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session Management</h1>
            <p className="text-gray-600">
              {user?.role === "admin"
                ? "Manage all class sessions"
                : "Manage your sessions and requests"}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new class session.
                </DialogDescription>
              </DialogHeader>
              <SessionForm
                onSubmit={handleAddSession}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">All sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  filteredSessions.filter((s) => s.status === "available")
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">Open for booking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Booked</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSessions.filter((s) => s.status === "booked").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled sessions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSessions.filter((s) => s.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Slot requests
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slotRequests.length}</div>
              <p className="text-xs text-muted-foreground">Requested slots</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="admin_created">Admin Created</SelectItem>
                  <SelectItem value="tutor_created">Tutor Created</SelectItem>
                  <SelectItem value="slot_request">Slot Request</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedSessions.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedSessions.length} session(s) selected
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("approve")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("reject")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction("delete")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All Sessions ({filteredSessions.length})
            </TabsTrigger>

            <TabsTrigger value="slot-requests">
              Slot Requests (
              {filteredSessions.filter((s) => s.type === "slot_request").length}
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>
                  {user?.role === "admin"
                    ? "All sessions in the system"
                    : "Your assigned and created sessions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedSessions.includes(session.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSessions([
                                  ...selectedSessions,
                                  session.id,
                                ]);
                              } else {
                                setSelectedSessions(
                                  selectedSessions.filter(
                                    (id) => id !== session.id
                                  )
                                );
                              }
                            }}
                          />
                          <div className="space-y-1">
                            <h3 className="font-semibold">{session.subject}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {session.tutor}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(session.date)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(session.time)}
                              </span>
                              <span>⏰ {session.duration}</span>
                            </div>
                            {session.students?.length > 0 && (
                              <div className="text-sm text-blue-600">
                                👨‍🎓 Student
                                {session.students.length > 1 ? "s" : ""}:{" "}
                                {session.students
                                  .map((s) => s.studentName)
                                  .join(", ")}
                              </div>
                            )}
                            {(session.status === "approved" || session.status === "booked") && session.meetingLink && (
                              <div className="text-sm text-blue-600 mt-1">
                                <a
                                  href={session.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-blue-800"
                                >
                                  📎 Meeting Link
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(session.status)}
                          {getTypeBadge(session.type)}
                          {canEditOrDelete(session) && (
                            <>
                              <Dialog
                                open={editingSession?.id === session.id}
                                onOpenChange={(open) => {
                                  if (!open) setEditingSession(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (
                                        !editingSession ||
                                        editingSession.id !== session.id
                                      )
                                        setEditingSession(session);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Edit Session</DialogTitle>
                                    <DialogDescription>
                                      Update the session details.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <SessionForm
                                    session={editingSession}
                                    onSubmit={handleUpdateSession}
                                    onCancel={() => setEditingSession(null)}
                                  />
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the session.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteSession(session.id)
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No sessions found matching your criteria.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slot-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Slot Requests</CardTitle>
                <CardDescription>
                  Student requests for your time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSessions
                    .filter((s) => s.type === "slot_request")
                    .length > 0 ? (
                    filteredSessions
                      .filter((s) => s.type === "slot_request")
                      .map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="space-y-1">
                            <h3 className="font-semibold">{session.subject}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>📅 {formatDate(session.date)}</span>
                              <span>🕐 {formatTime(session.time)}</span>
                              <span>⏰ {session.duration}</span>
                              {session.studentId && (
                                <span>👨‍🎓 Student ID: {session.studentId}</span>
                              )}
                            </div>
                            {session.description && (
                              <p className="text-sm text-gray-500">
                                📝 {session.description}
                              </p>
                            )}
                            {(session.status === "approved" || session.status === "booked") && session.meetingLink && (
                              <div className="text-sm text-blue-600 mt-1">
                                <a
                                  href={session.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-blue-800"
                                >
                                  📎 Meeting Link
                                </a>
                              </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TutorSession;
