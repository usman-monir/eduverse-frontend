
import React from 'react';
import { mockClassSessions } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Users, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const totalSessions = mockClassSessions.length;
  const bookedSessions = mockClassSessions.filter(s => s.status === 'booked').length;
  const availableSessions = mockClassSessions.filter(s => s.status === 'available').length;
  const completedSessions = mockClassSessions.filter(s => s.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'booked':
        return <Badge className="bg-blue-100 text-blue-800">Booked</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage sessions, study materials, and student progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">All time sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Booked Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{bookedSessions}</div>
              <p className="text-xs text-muted-foreground">Currently scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableSessions}</div>
              <p className="text-xs text-muted-foreground">Open for booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((completedSessions / totalSessions) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Sessions completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Overview of all class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClassSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{session.subject}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>👨‍🏫 {session.tutor}</span>
                      <span>📅 {session.date}</span>
                      <span>🕐 {session.time}</span>
                      <span>⏰ {session.duration}</span>
                    </div>
                    {session.studentId && (
                      <p className="text-sm text-blue-600">Student ID: {session.studentId}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(session.status)}
                    <Button variant="outline" size="sm">
                      {session.status === 'available' ? 'Edit' : 'View'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/sessions">
            <Button className="h-20 w-full">
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <span>Manage Sessions</span>
              </div>
            </Button>
          </Link>
          
          <Link to="/study-materials">
            <Button variant="outline" className="h-20 w-full">
              <div className="text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2" />
                <span>Study Materials</span>
              </div>
            </Button>
          </Link>
          
          <Link to="/admin/students">
            <Button variant="outline" className="h-20 w-full">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <span>View Students</span>
              </div>
            </Button>
          </Link>
          
          <Button variant="outline" className="h-20">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <span>Analytics</span>
            </div>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
