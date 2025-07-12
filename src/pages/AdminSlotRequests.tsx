
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Calendar, Clock, User, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { getSlotRequests, updateSlotRequestStatus } from '@/services/api';

interface SlotRequest {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  studentName: string;
  subject: string;
  preferredDate: string;
  preferredTime: string;
  duration: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedTutor?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  requestedTutorName?: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

const AdminSlotRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
  const [requests, setRequests] = useState<SlotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getSlotRequests();
      setRequests(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch slot requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setUpdating(requestId);
      await updateSlotRequestStatus(requestId, 'approved');
      
      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req._id === requestId 
            ? { ...req, status: 'approved' as const, approvedAt: new Date().toISOString() }
            : req
        )
      );
      
      toast({
        title: "Request approved!",
        description: "Student will receive confirmation email with meeting link.",
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setUpdating(requestId);
      await updateSlotRequestStatus(requestId, 'rejected');
      
      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req._id === requestId 
            ? { ...req, status: 'rejected' as const, rejectedAt: new Date().toISOString() }
            : req
        )
      );
      
      toast({
        title: "Request rejected",
        description: "Student will be notified about the rejection.",
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const RequestCard = ({ request }: { request: SlotRequest }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{request.studentId?.name || request.studentName}</h3>
          <p className="text-sm text-gray-600">{request.studentId?.email}</p>
        </div>
        {getStatusBadge(request.status)}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-gray-500" />
            <span>{request.requestedTutor?.name || request.requestedTutorName || 'Not specified'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(request.preferredDate)}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{request.preferredTime}</span>
          </div>
          <p className="text-gray-600">{request.subject}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Submitted: {formatDateTime(request.requestedAt)}
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
                      <p className="font-semibold">{selectedRequest.studentId?.name || selectedRequest.studentName}</p>
                      <p className="text-sm text-gray-600">{selectedRequest.studentId?.email}</p>
                      {selectedRequest.studentId?.phone && (
                        <p className="text-sm text-gray-600">{selectedRequest.studentId.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Requested Tutor</label>
                      <p>{selectedRequest.requestedTutor?.name || selectedRequest.requestedTutorName || 'Not specified'}</p>
                      {selectedRequest.requestedTutor?.email && (
                        <p className="text-sm text-gray-600">{selectedRequest.requestedTutor.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject</label>
                      <p>{selectedRequest.subject}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p>{selectedRequest.duration}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p>{formatDate(selectedRequest.preferredDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Time</label>
                      <p>{selectedRequest.preferredTime}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Message</label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted At</label>
                    <p>{formatDateTime(selectedRequest.requestedAt)}</p>
                  </div>

                  {selectedRequest.status === 'pending' && (
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={() => {
                          handleApproveRequest(selectedRequest._id);
                          setSelectedRequest(null);
                        }}
                        className="flex-1"
                        disabled={updating === selectedRequest._id}
                      >
                        {updating === selectedRequest._id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          handleRejectRequest(selectedRequest._id);
                          setSelectedRequest(null);
                        }}
                        className="flex-1"
                        disabled={updating === selectedRequest._id}
                      >
                        {updating === selectedRequest._id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
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
                onClick={() => handleApproveRequest(request._id)}
                disabled={updating === request._id}
              >
                {updating === request._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleRejectRequest(request._id)}
                disabled={updating === request._id}
              >
                {updating === request._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading slot requests...</span>
        </div>
      </DashboardLayout>
    );
  }

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
              <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Sessions rejected</p>
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
                  <RequestCard key={request._id} request={request} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No pending requests</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSlotRequests;
