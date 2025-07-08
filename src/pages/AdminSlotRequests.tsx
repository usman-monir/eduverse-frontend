
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Calendar, Clock, User, CheckCircle, XCircle, Eye } from 'lucide-react';

interface SlotRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const AdminSlotRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
  
  // Mock data for slot requests
  const [requests, setRequests] = useState<SlotRequest[]>([
    {
      id: '1',
      studentName: 'John Doe',
      studentEmail: 'john.doe@email.com',
      tutor: 'Dr. Smith',
      subject: 'Mathematics',
      date: '2024-07-10',
      time: '14:00',
      duration: '1 hour',
      message: 'Need help with calculus problems',
      status: 'pending',
      submittedAt: '2024-07-04 09:30'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      studentEmail: 'jane.smith@email.com',
      tutor: 'Prof. Johnson',
      subject: 'Physics',
      date: '2024-07-12',
      time: '10:00',
      duration: '1.5 hours',
      message: 'Preparing for upcoming exam',
      status: 'pending',
      submittedAt: '2024-07-04 11:15'
    },
    {
      id: '3',
      studentName: 'Mike Wilson',
      studentEmail: 'mike.wilson@email.com',
      tutor: 'Dr. Wilson',
      subject: 'Chemistry',
      date: '2024-07-08',
      time: '16:00',
      duration: '2 hours',
      message: 'Organic chemistry concepts',
      status: 'approved',
      submittedAt: '2024-07-03 14:20'
    }
  ]);

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  const handleApproveRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const }
          : req
      )
    );
    
    toast({
      title: "Request approved!",
      description: "Student will receive confirmation email with meeting link.",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const }
          : req
      )
    );
    
    toast({
      title: "Request rejected",
      description: "Student will be notified about the rejection.",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  const RequestCard = ({ request }: { request: SlotRequest }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{request.studentName}</h3>
          <p className="text-sm text-gray-600">{request.studentEmail}</p>
        </div>
        {getStatusBadge(request.status)}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-gray-500" />
            <span>{request.tutor}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{request.date}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{request.time}</span>
          </div>
          <p className="text-gray-600">{request.subject}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Submitted: {request.submittedAt}
        </span>
        
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Slot Request Details</DialogTitle>
                <DialogDescription>
                  Review the complete request information
                </DialogDescription>
              </DialogHeader>
              {selectedRequest && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Student</label>
                      <p className="font-semibold">{selectedRequest.studentName}</p>
                      <p className="text-sm text-gray-600">{selectedRequest.studentEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tutor</label>
                      <p>{selectedRequest.tutor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject</label>
                      <p>{selectedRequest.subject}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p>{selectedRequest.date}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Time</label>
                      <p>{selectedRequest.time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p>{selectedRequest.duration}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.message && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Message</label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.message}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted At</label>
                    <p>{selectedRequest.submittedAt}</p>
                  </div>

                  {selectedRequest.status === 'pending' && (
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={() => {
                          handleApproveRequest(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          handleRejectRequest(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {request.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => handleApproveRequest(request.id)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleRejectRequest(request.id)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Slot Requests</h1>
          <p className="text-gray-600">Manage student time slot requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Sessions scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Review and approve student time slot requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(request => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No pending requests</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>All slot requests and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSlotRequests;
