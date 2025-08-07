import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getSmartQuadById,
  getSmartQuadSessions,
  createSmartQuadSessions,
  deleteSmartQuadSessions,
  completeSmartQuadSession,
  updateSmartQuadSession,
} from '@/services/api';
import { SmartQuad, ClassSession } from '@/types';

interface WeeklyScheduleItem {
  day: string;
  time: string;
  duration: number;
  enabled: boolean;
}

const SESSION_STATUSES = ["pending", "available", "booked", "completed", "approved", "cancelled"];

const AdminSmartQuadSessions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [smartQuad, setSmartQuad] = useState<SmartQuad | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Session creation state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleItem[]>([
    { day: 'Monday', time: '10:00', duration: 60, enabled: false },
    { day: 'Tuesday', time: '10:00', duration: 60, enabled: false },
    { day: 'Wednesday', time: '10:00', duration: 60, enabled: false },
    { day: 'Thursday', time: '10:00', duration: 60, enabled: false },
    { day: 'Friday', time: '10:00', duration: 60, enabled: false },
    { day: 'Saturday', time: '10:00', duration: 60, enabled: false },
    { day: 'Sunday', time: '10:00', duration: 60, enabled: false },
  ]);
  const [creatingSessions, setCreatingSessions] = useState(false);
  const [deletingSessions, setDeletingSessions] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchSmartQuadData();
    }
  }, [id]);

  const fetchSmartQuadData = async () => {
    try {
      setLoading(true);
      const [smartQuadRes, sessionsRes] = await Promise.all([
        getSmartQuadById(id!),
        getSmartQuadSessions(id!),
      ]);

      setSmartQuad(smartQuadRes.data.data);
      setSessions(sessionsRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch Smart Quad data');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch Smart Quad data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSessions = async () => {
    try {
      setCreatingSessions(true);
      
      // Filter enabled schedule items
      const enabledSchedule = weeklySchedule
        .filter(item => item.enabled)
        .map(item => ({
          day: item.day,
          time: item.time,
          duration: item.duration,
        }));

      if (enabledSchedule.length === 0) {
        toast({
          title: 'Error',
          description: 'Please enable at least one day in the weekly schedule',
          variant: 'destructive',
        });
        return;
      }

      await createSmartQuadSessions(id!, {
        weeklySchedule: enabledSchedule,
      });

      toast({
        title: 'Success',
        description: 'Sessions created successfully',
      });

      setShowCreateDialog(false);
      fetchSmartQuadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create sessions',
        variant: 'destructive',
      });
    } finally {
      setCreatingSessions(false);
    }
  };

  const handleDeleteSessions = async () => {
    try {
      setDeletingSessions(true);
      await deleteSmartQuadSessions(id!);
      
      toast({
        title: 'Success',
        description: 'All sessions deleted successfully',
      });
      
      fetchSmartQuadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete sessions',
        variant: 'destructive',
      });
    } finally {
      setDeletingSessions(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await completeSmartQuadSession(id!, sessionId);
      
      toast({
        title: 'Success',
        description: 'Session marked as completed',
      });
      
      fetchSmartQuadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to complete session',
        variant: 'destructive',
      });
    }
  };

  const handleChangeStatus = async (sessionId: string, newStatus: string) => {
    try {
      setStatusUpdatingId(sessionId);
      await updateSmartQuadSession(id!, sessionId, { status: newStatus });
      toast({
        title: "Success",
        description: `Session status updated to ${newStatus}`,
      });
      fetchSmartQuadData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update session status",
        variant: "destructive",
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      booked: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      available: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading Smart Quad sessions...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !smartQuad) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error || 'Smart Quad not found'}</div>
        </div>
      </DashboardLayout>
    );
  }

  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const upcomingSessions = sessions.filter(s => s.status === 'booked' && new Date(s.date) > new Date()).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{smartQuad.name}</h1>
            <p className="text-muted-foreground">{smartQuad.description}</p>
          </div>
          <Button onClick={() => navigate('/admin/smart-quad')} variant="outline">
            Back to Smart Quads
          </Button>
        </div>

        {/* Smart Quad Info */}
        <Card>
          <CardHeader>
            <CardTitle>Smart Quad Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Tutor</Label>
                <p className="text-sm text-muted-foreground">
                  {typeof smartQuad.tutor === 'object' ? smartQuad.tutor.name : smartQuad.tutorName}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Students</Label>
                <p className="text-sm text-muted-foreground">
                  {smartQuad.currentStudents}/{smartQuad.maxStudents}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={smartQuad.status === 'active' ? 'default' : 'secondary'}>
                  {smartQuad.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Progress</Label>
                <p className="text-sm text-muted-foreground">
                  {completedSessions}/{sessions.length} sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Manage group sessions for this Smart Quad
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Sessions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Smart Quad Sessions</DialogTitle>
                      <DialogDescription>
                        Set up the weekly schedule for group sessions. Sessions will be created starting from today.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Removed start date and end date fields */}
                      
                      <div>
                        <Label className="text-sm font-medium">Weekly Schedule</Label>
                        <div className="space-y-2 mt-2">
                          {weeklySchedule.map((item, index) => (
                            <div key={item.day} className="flex items-center gap-4 p-3 border rounded-lg">
                              <Checkbox
                                checked={item.enabled}
                                onCheckedChange={(checked) => {
                                  const updated = [...weeklySchedule];
                                  updated[index].enabled = checked as boolean;
                                  setWeeklySchedule(updated);
                                }}
                              />
                              <div className="flex-1">
                                <Label className="text-sm font-medium">{item.day}</Label>
                              </div>
                              <div className="flex gap-2 min-w-[260px]">
                                <Input
                                  type="time"
                                  value={item.time}
                                  onChange={(e) => {
                                    const updated = [...weeklySchedule];
                                    updated[index].time = e.target.value;
                                    setWeeklySchedule(updated);
                                  }}
                                  className="w-36"
                                />
                                <Select
                                  value={item.duration.toString()}
                                  onValueChange={(value) => {
                                    const updated = [...weeklySchedule];
                                    updated[index].duration = parseInt(value);
                                    setWeeklySchedule(updated);
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="30">30m</SelectItem>
                                    <SelectItem value="45">45m</SelectItem>
                                    <SelectItem value="60">60m</SelectItem>
                                    <SelectItem value="90">90m</SelectItem>
                                    <SelectItem value="120">120m</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateSessions}
                        disabled={creatingSessions}
                        className="w-full"
                      >
                        {creatingSessions ? 'Creating...' : 'Create Sessions'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Sessions
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Sessions</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all sessions for this Smart Quad. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSessions}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deletingSessions ? 'Deleting...' : 'Delete All Sessions'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Sessions Created</h3>
                <p className="text-muted-foreground mb-4">
                  Create sessions to start the Smart Quad program
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{sessions.length}</div>
                      <p className="text-xs text-muted-foreground">Total Sessions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{completedSessions}</div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{upcomingSessions}</div>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sessions List */}
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Card key={session._id || session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">Session</div>
                              <div className="text-lg font-bold">{session.sessionNumber}</div>
                            </div>
                            <div>
                              <h3 className="font-medium">{session.subject}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(session.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(session.time)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {session.students?.length || 0} students
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={session.status}
                              onValueChange={(value) => handleChangeStatus(session._id || session.id, value)}
                              disabled={statusUpdatingId === (session._id || session.id)}
                            >
                              <SelectTrigger className="w-[90px] h-8 text-xs border-green-400 focus:ring-green-300 px-2 py-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SESSION_STATUSES.map((status) => (
                                  <SelectItem key={status} value={status} className="text-xs">
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {session.meetingLink && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(session.meetingLink, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSmartQuadSessions; 