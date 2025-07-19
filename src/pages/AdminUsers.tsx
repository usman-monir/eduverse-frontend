
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { UserPlus, Mail, Users, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { getAdminUsers, approveUser, inviteUser, restrictStudentAccess, enableStudentAccess } from '@/services/api';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface InviteForm {
  name: string;
  email: string;
  role: 'student' | 'tutor';
  temporaryPassword: string;
  phone?: string;
  subjects?: string[];
  experience?: string;
}

const AdminUsers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<InviteForm>({
    defaultValues: {
      name: '',
      email: '',
      role: 'student',
      temporaryPassword: '',
      phone: '',
      subjects: [],
      experience: '',
    },
    mode: 'onChange',
  });

  const [tab, setTab] = useState<'student' | 'tutor'>('student');
  const [students, setStudents] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [restrictDialogOpen, setRestrictDialogOpen] = useState<string | null>(null);
  const [restrictDate, setRestrictDate] = useState<string>('');
  const [restrictingId, setRestrictingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [studentsRes, tutorsRes] = await Promise.all([
        getAdminUsers({ role: 'student', limit: 100 }),
        getAdminUsers({ role: 'tutor', limit: 100 }),
      ]);
      setStudents(studentsRes.data.data || []);
      setTutors(tutorsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const users = tab === 'student' ? students : tutors;

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    form.setValue('temporaryPassword', password);
  };

  const onSubmit = async (data: InviteForm) => {
    setIsSubmitting(true);
    try {
      // Prepare the data for the API
      const inviteData = {
        name: data.name,
        email: data.email,
        role: data.role,
        temporaryPassword: data.temporaryPassword,
        phone: data.phone || undefined,
        subjects: data.role === 'tutor' ? data.subjects : undefined,
        experience: data.role === 'tutor' ? data.experience : undefined,
      };

      await inviteUser(inviteData);
      
      toast({
        title: "Invitation Sent",
        description: `Invitation email sent to ${data.email} with temporary password.`,
      });
      
      form.reset();
      setIsDialogOpen(false);
      
      // Refresh the users list
      await fetchUsers();
    } catch (error: any) {
      console.error('Failed to invite user:', error);
      const errorMessage = error.response?.data?.message || "Failed to send invitation. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return null;
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'tutor' ? <GraduationCap className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      toast({
        title: "User Approved",
        description: "User has been approved and can now log in.",
      });
      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRestrictAccess = async (userId: string) => {
    setRestrictingId(userId);
    try {
      const utcISOString = new Date(restrictDate).toISOString();
      console.log(utcISOString)
      await restrictStudentAccess(userId, utcISOString);
      toast({
        title: 'Access Restricted',
        description: 'Student access has been restricted.',
      });
      setRestrictDialogOpen(null);
      setRestrictDate('');
      await fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restrict access.',
        variant: 'destructive',
      });
    } finally {
      setRestrictingId(null);
    }
  };
  const handleEnableAccess = async (userId: string) => {
    setRestrictingId(userId);
    try {
      await enableStudentAccess(userId);
      toast({
        title: 'Access Enabled',
        description: 'Student access has been enabled.',
      });
      await fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable access.',
        variant: 'destructive',
      });
    } finally {
      setRestrictingId(null);
    }
  };

  const watchedRole = form.watch('role');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Add and manage tutors and students</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation email with login credentials to a new tutor or student.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Full name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedRole === 'tutor' && (
                    <>
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 5 years teaching Mathematics" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subjects (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Mathematics, Physics, Chemistry" 
                                {...field}
                                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                onChange={(e) => {
                                  const subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                  field.onChange(subjects);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="temporaryPassword"
                    rules={{ 
                      required: 'Temporary password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporary Password</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input placeholder="Generated password" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" onClick={generatePassword}>
                            Generate
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Invitation'}
                      <Mail className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length + tutors.length}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{tutors.length}</div>
              <p className="text-xs text-muted-foreground">Active tutors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {students.filter(u => u.status === 'pending').length + tutors.filter(u => u.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Students and Tutors */}
        <div className="flex space-x-4 border-b mb-4">
          <button
            className={`px-4 py-2 font-medium ${tab === 'student' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setTab('student')}
          >
            Students
          </button>
          <button
            className={`px-4 py-2 font-medium ${tab === 'tutor' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
            onClick={() => setTab('tutor')}
          >
            Tutors
          </button>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>{tab === 'student' ? 'Students' : 'Tutors'}</CardTitle>
            <CardDescription>Manage registered {tab === 'student' ? 'students' : 'tutors'}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : (
            <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Joined: {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : ''}</p>
                        {user.role === 'student' && user.accessTill && (
                          <p className="text-xs text-red-600 font-semibold">Restricted until: {format(new Date(user.accessTill), 'yyyy-MM-dd HH:mm')}</p>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    {getStatusBadge(user.status)}
                      {user.status === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => handleApproveUser(user._id)}>
                          Approve
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${user._id}`)}>
                        View Profile
                    </Button>
                    {user.role !== 'admin' && (
                      <>
                        <Dialog open={restrictDialogOpen === user._id} onOpenChange={(open) => setRestrictDialogOpen(open ? user._id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Restrict Access
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Restrict Access</DialogTitle>
                              <DialogDescription>
                                Set a date and time until which this student cannot access the platform.
                              </DialogDescription>
                            </DialogHeader>
                            <Input
                              type="datetime-local"
                              value={restrictDate}
                              onChange={(e) => setRestrictDate(e.target.value)}
                              className="mb-4"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setRestrictDialogOpen(null)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleRestrictAccess(user._id)}
                                disabled={restrictingId === user._id || !restrictDate}
                              >
                                {restrictingId === user._id ? 'Restricting...' : 'Restrict'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {user.accessTill && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 border-green-400"
                            onClick={() => handleEnableAccess(user._id)}
                            disabled={restrictingId === user._id}
                          >
                            {restrictingId === user._id ? 'Enabling...' : 'Enable Access'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
                {users.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No users found.</div>
                )}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
