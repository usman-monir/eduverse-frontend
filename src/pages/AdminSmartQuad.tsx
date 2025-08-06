import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { 
  getSmartQuads, 
  createSmartQuad, 
  updateSmartQuad, 
  deleteSmartQuad, 
  addStudentToSmartQuad, 
  removeStudentFromSmartQuad,
  getAvailableSmartQuads,
  getAdminUsers,
  getAllTutorsWithSubjects
} from '@/services/api';
import { SmartQuad, User } from '@/types';
import { 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Target,
  Globe,
  GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';

interface SmartQuadForm {
  name: string;
  description: string;
  tutor: string;
  courseType: 'one-on-one' | 'smart-quad';
  preferredLanguage: 'English' | 'Hindi' | 'Punjabi' | 'Nepali';
  desiredScore: number;
  examDeadline: string;
  courseDuration: number;
  totalSessions: number;
  courseExpiryDate: string;
  weeklySchedule: {
    day: string;
    time: string;
    duration: number;
  }[];
}

const AdminSmartQuad = () => {
  const [smartQuads, setSmartQuads] = useState<SmartQuad[]>([]);
  const [tutors, setTutors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [editingSmartQuad, setEditingSmartQuad] = useState<SmartQuad | null>(null);
  const [selectedSmartQuad, setSelectedSmartQuad] = useState<SmartQuad | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Helper function to format dates for HTML date inputs
  const formatDateForInput = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const form = useForm<SmartQuadForm>({
    defaultValues: {
      name: '',
      description: '',
      tutor: '',
      courseType: 'smart-quad',
      preferredLanguage: 'English',
      desiredScore: 75,
      examDeadline: '',
      courseDuration: 8,
      totalSessions: 24,
      courseExpiryDate: '',
      weeklySchedule: []
    },
    mode: 'onChange',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [smartQuadsRes, tutorsRes, studentsRes] = await Promise.all([
        getSmartQuads({ limit: 100 }),
        getAllTutorsWithSubjects(),
        getAdminUsers({ role: 'student', limit: 100 })
      ]);
      
      setSmartQuads(smartQuadsRes.data.data || []);
      setTutors(tutorsRes.data.data || []);
      setStudents(studentsRes.data.data || []);
      
      console.log('Loaded students:', studentsRes.data.data); // Debug log
      console.log('First student structure:', studentsRes.data.data[0]); // Debug log
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load Smart Quad data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      forming: { color: 'bg-yellow-100 text-yellow-800', label: 'Forming' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.forming;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getLanguageBadge = (language: string) => {
    return <Badge variant="outline" className="text-xs">{language}</Badge>;
  };

  const filteredSmartQuads = smartQuads.filter(smartQuad => {
    const matchesStatus = filterStatus === 'all' || smartQuad.status === filterStatus;
    const matchesSearch = smartQuad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         smartQuad.tutorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateSmartQuad = async (data: SmartQuadForm) => {
    console.log('Creating Smart Quad with data:', data); // Debug log
    
    // Manual validation
    const errors: string[] = [];
    if (!data.name?.trim()) errors.push('Batch name is required');
    if (!data.tutor?.trim()) errors.push('Tutor is required');
    if (!data.examDeadline) errors.push('Exam deadline is required');
    if (!data.courseExpiryDate) errors.push('Course expiry date is required');
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createSmartQuad(data);
      toast({
        title: "Success",
        description: "Smart Quad batch created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      console.error('Create Smart Quad error:', error); // Debug log
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create Smart Quad batch",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSmartQuad = async (data: SmartQuadForm) => {
    if (!editingSmartQuad) return;
    
    // Use _id if available, fallback to id
    const smartQuadId = editingSmartQuad._id || editingSmartQuad.id;
    console.log('Updating Smart Quad with ID:', smartQuadId); // Debug log
    
    try {
      await updateSmartQuad(smartQuadId, data);
      toast({
        title: "Success",
        description: "Smart Quad batch updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingSmartQuad(null);
      form.reset();
      fetchData();
    } catch (error) {
      console.error('Update Smart Quad error:', error); // Debug log
      toast({
        title: "Error",
        description: "Failed to update Smart Quad batch",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSmartQuad = async (id: string) => {
    try {
      await deleteSmartQuad(id);
      toast({
        title: "Success",
        description: "Smart Quad batch deleted successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Smart Quad batch",
        variant: "destructive"
      });
    }
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedSmartQuad) return;
    
    console.log('Adding student with ID:', studentId); // Debug log
    console.log('Selected Smart Quad:', selectedSmartQuad); // Debug log
    
    // Use _id if available, fallback to id
    const smartQuadId = selectedSmartQuad._id || selectedSmartQuad.id;
    
    try {
      await addStudentToSmartQuad(smartQuadId, studentId);
      toast({
        title: "Success",
        description: "Student added to Smart Quad batch successfully",
      });
      setIsAddStudentDialogOpen(false);
      setSelectedSmartQuad(null);
      fetchData();
    } catch (error: any) {
      console.error('Add student error:', error); // Debug log
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add student to Smart Quad batch",
        variant: "destructive"
      });
    }
  };

  const handleAddMultipleStudents = async () => {
    if (!selectedSmartQuad || selectedStudents.length === 0) return;
    
    console.log('Adding multiple students:', selectedStudents); // Debug log
    
    // Use _id if available, fallback to id
    const smartQuadId = selectedSmartQuad._id || selectedSmartQuad.id;
    
    try {
      // For now, add students one by one (we can optimize this later with a bulk API)
      for (const studentId of selectedStudents) {
        await addStudentToSmartQuad(smartQuadId, studentId);
      }
      
      toast({
        title: "Success",
        description: `${selectedStudents.length} student(s) added to Smart Quad batch successfully`,
      });
      setIsAddStudentDialogOpen(false);
      setSelectedSmartQuad(null);
      setSelectedStudents([]);
      fetchData();
    } catch (error: any) {
      console.error('Add multiple students error:', error); // Debug log
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add students to Smart Quad batch",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStudent = async (smartQuadId: string, studentId: string) => {
    console.log('Removing student with ID:', studentId); // Debug log
    console.log('Smart Quad ID:', smartQuadId); // Debug log
    
    try {
      await removeStudentFromSmartQuad(smartQuadId, studentId);
      toast({
        title: "Success",
        description: "Student removed from Smart Quad batch successfully",
      });
      fetchData();
    } catch (error: any) {
      console.error('Remove student error:', error); // Debug log
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove student from Smart Quad batch",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (smartQuad: SmartQuad) => {
    console.log('Opening edit dialog for:', smartQuad); // Debug log
    console.log('Smart Quad ID:', smartQuad._id || smartQuad.id); // Debug log
    setEditingSmartQuad(smartQuad);
    
    // Extract tutor ID from nested tutor object or use string value
    const tutorId = typeof smartQuad.tutor === 'object' && smartQuad.tutor !== null 
      ? (smartQuad.tutor as any)._id || (smartQuad.tutor as any).id 
      : smartQuad.tutor;
    
    const formData = {
      name: smartQuad.name,
      description: smartQuad.description || '',
      tutor: tutorId,
      courseType: smartQuad.courseType,
      preferredLanguage: smartQuad.preferredLanguage,
      desiredScore: smartQuad.desiredScore,
      examDeadline: formatDateForInput(smartQuad.examDeadline),
      courseDuration: smartQuad.courseDuration,
      totalSessions: smartQuad.totalSessions,
      courseExpiryDate: formatDateForInput(smartQuad.courseExpiryDate),
      weeklySchedule: smartQuad.weeklySchedule
    };
    
    console.log('Form data being set:', formData); // Debug log
    form.reset(formData);
    setIsEditDialogOpen(true);
  };

  const openAddStudentDialog = (smartQuad: SmartQuad) => {
    setSelectedSmartQuad(smartQuad);
    setIsAddStudentDialogOpen(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Smart Quad Management</h1>
            <p className="text-gray-600 mt-2">Manage group classes and student assignments</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Smart Quad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Smart Quad Batch</DialogTitle>
                <DialogDescription>
                  Create a new group class with specific preferences and schedule
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateSmartQuad)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Advanced PTE Batch A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tutor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tutor *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              console.log('Tutor selected:', value); // Debug log
                              field.onChange(value);
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tutor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tutors.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No tutors available
                                </SelectItem>
                              ) : (
                                tutors.map((tutor) => (
                                  <SelectItem key={tutor._id || tutor.id} value={tutor._id || tutor.id}>
                                    {tutor.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Group class for advanced PTE students" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Language</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Hindi">Hindi</SelectItem>
                              <SelectItem value="Punjabi">Punjabi</SelectItem>
                              <SelectItem value="Nepali">Nepali</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="desiredScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Score</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="90" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="courseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="smart-quad">Smart Quad</SelectItem>
                              <SelectItem value="one-on-one">One-on-One</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="examDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Deadline *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="courseExpiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Expiry Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="courseDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Duration (weeks)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalSessions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Sessions</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Smart Quad</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search Smart Quad batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="forming">Forming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Smart Quad List */}
        <div className="grid gap-6">
          {filteredSmartQuads.map((smartQuad) => (
            <Card key={smartQuad.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {smartQuad.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {smartQuad.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(smartQuad.status)}
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(smartQuad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Smart Quad Batch</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{smartQuad.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSmartQuad(smartQuad._id || smartQuad.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {smartQuad.currentStudents}/{smartQuad.maxStudents} Students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{smartQuad.tutorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    {getLanguageBadge(smartQuad.preferredLanguage)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Score: {smartQuad.desiredScore}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Deadline: {format(new Date(smartQuad.examDeadline), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {smartQuad.completedSessions}/{smartQuad.totalSessions} Sessions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Expires: {format(new Date(smartQuad.courseExpiryDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {smartQuad.courseDuration} weeks
                    </span>
                  </div>
                </div>

                {/* Students List */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Students</h4>
                    {smartQuad.currentStudents < smartQuad.maxStudents && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddStudentDialog(smartQuad)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Student
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {smartQuad.students.map((student) => {
                      const studentKey = typeof student.studentId === 'object' && student.studentId !== null 
                        ? (student.studentId as any)._id 
                        : student.studentId;
                      return (
                        <div key={studentKey} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{student.studentName}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {student.studentName} from this batch?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                console.log('Removing student:', student); // Debug log
                                // Extract student ID from the student object
                                const studentId = typeof student.studentId === 'object' && student.studentId !== null 
                                  ? (student.studentId as any)._id 
                                  : student.studentId;
                                console.log('Extracted student ID:', studentId); // Debug log
                                handleRemoveStudent(smartQuad._id || smartQuad.id, studentId);
                              }}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                    {smartQuad.students.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No students assigned yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredSmartQuads.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Smart Quad batches found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Create your first Smart Quad batch to get started'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Smart Quad
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Smart Quad Batch</DialogTitle>
              <DialogDescription>
                Update the Smart Quad batch details
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateSmartQuad)} className="space-y-4">
                {/* Same form fields as create dialog */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tutor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tutor</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            console.log('Edit dialog - Tutor selected:', value); // Debug log
                            field.onChange(value);
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tutors.map((tutor) => (
                              <SelectItem key={tutor._id || tutor.id} value={tutor._id || tutor.id}>
                                {tutor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Punjabi">Punjabi</SelectItem>
                            <SelectItem value="Nepali">Nepali</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="desiredScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Score</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="smart-quad">Smart Quad</SelectItem>
                            <SelectItem value="one-on-one">One-on-One</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="examDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="courseDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Duration (weeks)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalSessions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Sessions</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Smart Quad</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Student Dialog */}
        <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Students to Smart Quad</DialogTitle>
              <DialogDescription>
                Select students to add to "{selectedSmartQuad?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {students
                  .filter(student => {
                    const studentId = typeof student._id === 'string' ? student._id : student.id;
                    return !selectedSmartQuad?.students.some(sqStudent => {
                      const sqStudentId = typeof sqStudent.studentId === 'object' && sqStudent.studentId !== null 
                        ? (sqStudent.studentId as any)._id 
                        : sqStudent.studentId;
                      return sqStudentId === studentId;
                    });
                  })
                  .map((student) => {
                    const studentId = typeof student._id === 'string' ? student._id : student.id;
                    return (
                      <div
                        key={studentId}
                        className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50"
                      >
                        <Checkbox
                          id={studentId}
                          checked={selectedStudents.includes(studentId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudents([...selectedStudents, studentId]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== studentId));
                            }
                          }}
                        />
                                              <label
                          htmlFor={studentId}
                          className="flex-1 cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </label>
                      </div>
                    );
                  })}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {selectedStudents.length} student(s) selected
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddStudentDialogOpen(false);
                      setSelectedStudents([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddMultipleStudents}
                    disabled={selectedStudents.length === 0}
                  >
                    Add Selected ({selectedStudents.length})
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminSmartQuad; 