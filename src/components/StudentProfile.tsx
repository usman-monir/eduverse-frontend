
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, BookOpen, Clock, CheckCircle } from 'lucide-react';

interface StudentProfileProps {
  student: any;
  onClose: () => void;
}

const StudentProfile = ({ student, onClose }: StudentProfileProps) => {
  // Mock session data for the student
  const studentSessions = [
    {
      id: '1',
      subject: 'Mathematics',
      tutor: 'Dr. Sarah Wilson',
      date: '2024-07-10',
      time: '10:00 AM',
      status: 'upcoming',
      type: 'Regular Class'
    },
    {
      id: '2',
      subject: 'Physics',
      tutor: 'Prof. John Smith',
      date: '2024-07-05',
      time: '2:00 PM',
      status: 'completed',
      type: 'Lab Session'
    },
    {
      id: '3',
      subject: 'Chemistry',
      tutor: 'Dr. Emily Brown',
      date: '2024-07-12',
      time: '11:00 AM',
      status: 'upcoming',
      type: 'Tutorial'
    }
  ];

  const upcomingSessions = studentSessions.filter(s => s.status === 'upcoming');
  const completedSessions = studentSessions.filter(s => s.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Student Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback className="text-xl">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{student.name}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                    <Badge variant="outline">Student</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {student.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {student.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined: {new Date(student.joinedDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{student.enrolledSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{student.completedSessions}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{upcomingSessions.length}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{session.subject}</h4>
                        <p className="text-sm text-gray-600">with {session.tutor}</p>
                        <p className="text-xs text-gray-500">{session.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.date}</p>
                        <p className="text-sm text-gray-600">{session.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming sessions</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Completed Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Recent Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedSessions.length > 0 ? (
                <div className="space-y-3">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                      <div>
                        <h4 className="font-medium">{session.subject}</h4>
                        <p className="text-sm text-gray-600">with {session.tutor}</p>
                        <p className="text-xs text-gray-500">{session.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.date}</p>
                        <p className="text-sm text-gray-600">{session.time}</p>
                        <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No completed sessions</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
