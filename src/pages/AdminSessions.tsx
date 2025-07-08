import React, { useState } from 'react';
import { useSessionManager } from '@/hooks/useSessionManager';
import { ClassSession } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import DashboardLayout from '@/components/Layout/DashboardLayout';
import SessionForm from '@/components/SessionForm';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSessions = () => {
  const { sessions, loading, error, addSession, updateSession, deleteSession } =
    useSessionManager();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null
  );
  const { toast } = useToast();

  const filteredSessions = sessions?.filter((session) => {
    const matchesStatus =
      filterStatus === 'all' || session.status === filterStatus;
    const matchesSearch =
      session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tutor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className='bg-green-100 text-green-800'>Available</Badge>;
      case 'booked':
        return <Badge className='bg-blue-100 text-blue-800'>Booked</Badge>;
      case 'completed':
        return <Badge className='bg-gray-100 text-gray-800'>Completed</Badge>;
      default:
        return null;
    }
  };

  const handleAddSession = async (sessionData: Omit<ClassSession, 'id'>) => {
    await addSession(sessionData);
    setIsAddDialogOpen(false);
    toast({
      title: 'Session Created',
      description: 'New session has been created successfully.',
    });
  };

  const handleUpdateSession = async (sessionData: Omit<ClassSession, 'id'>) => {
    const sessionId = editingSession?.id || (editingSession as any)?._id;
    if (sessionId) {
      await updateSession(sessionId, sessionData);
      setEditingSession(null);
      toast({
        title: 'Session Updated',
        description: 'Session has been updated successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Session ID is missing.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (id: string | undefined) => {
    const sessionId = id || (id as any)?._id;
    if (sessionId) {
      await deleteSession(sessionId);
      toast({
        title: 'Session Deleted',
        description: 'Session has been deleted successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Session ID is missing.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <span className='text-lg'>Loading sessions...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-red-500'>Error loading sessions: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Manage Sessions</h1>
            <p className='text-gray-600'>Create and manage class sessions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Add New Session
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
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

        <div className='flex flex-col md:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search sessions...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className='w-full md:w-48'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Sessions</SelectItem>
              <SelectItem value='available'>Available</SelectItem>
              <SelectItem value='booked'>Booked</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Sessions ({filteredSessions?.length})</CardTitle>
            <CardDescription>Overview of all class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {filteredSessions?.length > 0 ? (
                filteredSessions?.map((session) => (
                  <div
                    key={session.id || (session as any)._id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='space-y-1 flex-1'>
                      <h3 className='font-semibold'>{session.subject}</h3>
                      <div className='flex items-center space-x-4 text-sm text-gray-600'>
                        <span className='flex items-center'>
                          <User className='h-4 w-4 mr-1' />
                          {session.tutor}
                        </span>
                        <span className='flex items-center'>
                          <Calendar className='h-4 w-4 mr-1' />
                          {session.date}
                        </span>
                        <span className='flex items-center'>
                          <Clock className='h-4 w-4 mr-1' />
                          {session.time}
                        </span>
                        <span>⏰ {session.duration}</span>
                      </div>
                      {session.studentId && (
                        <p className='text-sm text-blue-600'>
                          Student ID: {session.studentId}
                        </p>
                      )}
                      {session.description && (
                        <p className='text-sm text-gray-500'>
                          {session.description}
                        </p>
                      )}
                      {session.meetingLink && (
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              window.open(session.meetingLink, '_blank')
                            }
                            className='text-blue-600'
                          >
                            <ExternalLink className='h-4 w-4 mr-1' />
                            Join Meeting
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className='flex items-center space-x-2'>
                      {getStatusBadge(session.status)}
                      <Dialog
                        open={
                          (editingSession?.id ??
                            (editingSession as any)?._id) ===
                          (session.id ?? (session as any)._id)
                        }
                        onOpenChange={(open) => {
                          if (!open) setEditingSession(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              if (
                                !editingSession ||
                                (editingSession.id ??
                                  (editingSession as any)._id) !==
                                  (session.id ?? (session as any)._id)
                              )
                                setEditingSession(session);
                            }}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-2xl'>
                          <DialogHeader>
                            <DialogTitle>Edit Session</DialogTitle>
                            <DialogDescription>
                              Update the session details.
                            </DialogDescription>
                          </DialogHeader>
                          <SessionForm
                            session={session}
                            onSubmit={handleUpdateSession}
                            onCancel={() => setEditingSession(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant='outline' size='sm'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the session.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteSession(
                                  session.id || (session as any)._id
                                )
                              }
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-500'>
                    No sessions found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSessions;
