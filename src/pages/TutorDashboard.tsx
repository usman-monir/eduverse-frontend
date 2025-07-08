
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockClassSessions } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ClassSession } from '@/types';

const TutorDashboard = () => {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  
  const todaySessions = mockClassSessions.filter(session => 
    session.status === 'booked' && session.tutor === user?.name
  );

  const upcomingSessions = mockClassSessions.filter(session => 
    session.status === 'booked'
  );

  const completedSessions = mockClassSessions.filter(session => 
    session.status === 'completed'
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-green-100">
            Ready to teach today? You have {todaySessions.length} sessions scheduled.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
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
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSessions.length}</div>
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
              <div className="text-2xl font-bold">{completedSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Sessions completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">
                Average student rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
            <CardDescription>Your scheduled classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySessions.length > 0 ? (
                todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{session.subject}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>🕐 {session.time}</span>
                        <span>⏰ {session.duration}</span>
                        <span>👨‍🎓 Student ID: {session.studentId}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {session.status}
                      </Badge>
                      <Button size="sm">Start Session</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No sessions scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>All your booked sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{session.subject}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📅 {session.date}</span>
                      <span>🕐 {session.time}</span>
                      <span>⏰ {session.duration}</span>
                      {session.studentId && (
                        <span>👨‍🎓 Student ID: {session.studentId}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.status === 'booked' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Session Details</DialogTitle>
                        </DialogHeader>
                        {selectedSession && (
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Subject</label>
                                <p className="text-lg font-semibold">{selectedSession.subject}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Date</label>
                                <p>{selectedSession.date}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Time</label>
                                <p>{selectedSession.time}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Duration</label>
                                <p>{selectedSession.duration}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="mt-1">
                                  <Badge variant={selectedSession.status === 'booked' ? 'default' : 'secondary'}>
                                    {selectedSession.status}
                                  </Badge>
                                </div>
                              </div>
                              {selectedSession.studentId && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                                  <p>{selectedSession.studentId}</p>
                                </div>
                              )}
                              {selectedSession.meetingLink && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Meeting Link</label>
                                  <p className="text-blue-600 hover:underline cursor-pointer">
                                    {selectedSession.meetingLink}
                                  </p>
                                </div>
                              )}
                              {selectedSession.description && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Description</label>
                                  <p>{selectedSession.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/tutor/sessions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold">Manage Sessions</h3>
                <p className="text-sm text-gray-600 mt-2">
                  View and manage your teaching sessions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold">Messages</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Communicate with your students
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/tutor/courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold">Course Materials</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Manage your course materials and content
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TutorDashboard;
