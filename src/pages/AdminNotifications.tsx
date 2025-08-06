import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  getNotificationStats,
  sendCourseExpiryNotifications,
  sendSmartQuadAvailabilityNotifications,
  sendSessionCancellationNotifications,
  getSmartQuads
} from '@/services/api';
import { NotificationStats, SmartQuad } from '@/types';
import { 
  Bell, 
  Mail, 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  TrendingUp,
  BookOpen,
  UserCheck,
  UserX
} from 'lucide-react';

const AdminNotifications = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [smartQuads, setSmartQuads] = useState<SmartQuad[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [selectedSmartQuad, setSelectedSmartQuad] = useState<SmartQuad | null>(null);
  const [isSmartQuadDialogOpen, setIsSmartQuadDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, smartQuadsRes] = await Promise.all([
        getNotificationStats(),
        getSmartQuads({ status: 'forming', limit: 100 })
      ]);
      
      setStats(statsRes.data.data);
      setSmartQuads(smartQuadsRes.data.data || []);
      
      console.log('Loaded Smart Quads for notifications:', smartQuadsRes.data.data); // Debug log
    } catch (error) {
      console.error('Failed to fetch notification data:', error);
      toast({
        title: "Error",
        description: "Failed to load notification statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendCourseExpiryNotifications = async () => {
    setSendingNotifications(true);
    try {
      const response = await sendCourseExpiryNotifications();
      const result = response.data;
      
      toast({
        title: "Course Expiry Notifications Sent",
        description: `Successfully sent ${result.notificationsSent} notifications. ${result.notificationsFailed} failed.`,
        variant: result.notificationsFailed > 0 ? "destructive" : "default"
      });
      
      fetchData(); // Refresh stats
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send course expiry notifications",
        variant: "destructive"
      });
    } finally {
      setSendingNotifications(false);
    }
  };

  const handleSendSmartQuadAvailabilityNotifications = async (smartQuadId: string) => {
    console.log('Sending Smart Quad availability notifications for ID:', smartQuadId); // Debug log
    setSendingNotifications(true);
    try {
      const response = await sendSmartQuadAvailabilityNotifications(smartQuadId);
      const result = response.data;
      
      toast({
        title: "Smart Quad Availability Notifications Sent",
        description: `Successfully sent ${result.notificationsSent} notifications. ${result.notificationsFailed} failed.`,
        variant: result.notificationsFailed > 0 ? "destructive" : "default"
      });
      
      setIsSmartQuadDialogOpen(false);
      setSelectedSmartQuad(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send Smart Quad availability notifications",
        variant: "destructive"
      });
    } finally {
      setSendingNotifications(false);
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'Available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Unavailable':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
            <p className="text-gray-600 mt-2">Manage automated notifications and alerts</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Students</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.expiringStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Students with courses expiring in 10 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Smart Quads</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.activeSmartQuads || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently active group classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students in Smart Quads</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.studentsInSmartQuads || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total students in group classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notification Types</CardTitle>
              <Bell className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(stats?.notificationTypes || {}).filter(type => type === 'Available').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Available notification types
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Expiry Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                Course Expiry Notifications
              </CardTitle>
              <CardDescription>
                Send notifications to students whose courses expire in 10 days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(stats?.notificationTypes.courseExpiry || 'Unavailable')}
                  <span className="text-sm font-medium">
                    {stats?.notificationTypes.courseExpiry || 'Unavailable'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stats?.expiringStudents || 0} students
                </Badge>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={!stats?.expiringStudents || sendingNotifications}
                  >
                    {sendingNotifications ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Course Expiry Notifications
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send Course Expiry Notifications</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send email notifications to {stats?.expiringStudents || 0} students whose courses expire in 10 days. 
                      Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSendCourseExpiryNotifications}>
                      Send Notifications
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Smart Quad Availability Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Smart Quad Availability Notifications
              </CardTitle>
              <CardDescription>
                Notify eligible students about available Smart Quad batches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(stats?.notificationTypes.smartQuadAssignment || 'Unavailable')}
                  <span className="text-sm font-medium">
                    {stats?.notificationTypes.smartQuadAssignment || 'Unavailable'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {smartQuads.length} batches
                </Badge>
              </div>
              
              <Dialog open={isSmartQuadDialogOpen} onOpenChange={setIsSmartQuadDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={smartQuads.length === 0 || sendingNotifications}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Smart Quad Notifications
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Smart Quad Batch</DialogTitle>
                    <DialogDescription>
                      Choose a Smart Quad batch to send availability notifications to eligible students
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {smartQuads.map((smartQuad) => (
                        <div
                          key={smartQuad._id || smartQuad.id}
                          className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedSmartQuad(smartQuad);
                            handleSendSmartQuadAvailabilityNotifications(smartQuad._id || smartQuad.id);
                          }}
                        >
                          <div>
                            <p className="font-medium">{smartQuad.name}</p>
                            <p className="text-sm text-gray-500">
                              {smartQuad.currentStudents}/{smartQuad.maxStudents} students • {smartQuad.preferredLanguage}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {smartQuads.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        No forming Smart Quad batches available
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Notification Types Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Types Status
            </CardTitle>
            <CardDescription>
              Overview of all available notification types and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.notificationTypes && Object.entries(stats.notificationTypes).map(([type, status]) => (
                <div key={type} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm font-medium">
                      {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </div>
                  <Badge variant={status === 'Available' ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Notification Activity
            </CardTitle>
            <CardDescription>
              Track recent notification activities and their success rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Course Expiry Notifications</p>
                    <p className="text-xs text-gray-500">Last sent: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stats?.expiringStudents || 0} recipients
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Smart Quad Assignment</p>
                    <p className="text-xs text-gray-500">Last sent: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stats?.studentsInSmartQuads || 0} students
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <UserX className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">Smart Quad Removal</p>
                    <p className="text-xs text-gray-500">Last sent: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  0 recipients
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications; 