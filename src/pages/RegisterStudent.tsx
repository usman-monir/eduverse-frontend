import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';
import { getSubjects } from '@/services/api';
import { Subject } from '@/types';

const RegisterStudent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      try {
        const response = await getSubjects({ isActive: true });
        setSubjects(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subjects. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setSubjectsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const addSubject = (subjectName: string) => {
    if (!selectedSubjects.includes(subjectName)) {
      setSelectedSubjects([...selectedSubjects, subjectName]);
    }
  };

  const removeSubject = (subjectName: string) => {
    setSelectedSubjects(selectedSubjects.filter(subject => subject !== subjectName));
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Science': 'bg-blue-100 text-blue-800',
      'Mathematics': 'bg-purple-100 text-purple-800',
      'Language': 'bg-green-100 text-green-800',
      'Arts': 'bg-pink-100 text-pink-800',
      'Social Studies': 'bg-orange-100 text-orange-800',
      'Computer Science': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Other'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: 'Subjects required',
        description: 'Please select at least one subject.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone,
        grade,
        subjects: selectedSubjects,
      });
      
      // Show pending approval message instead of redirecting
      toast({
        title: 'Registration submitted!',
        description: 'Your account is pending admin approval. You will receive an email when approved.',
      });
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setGrade('');
      setSelectedSubjects([]);
      
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again with different credentials.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='bg-blue-600 p-3 rounded-full'>
              <GraduationCap className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-4xl font-bold text-blue-600 mb-2'>EduPortal</h1>
          <p className='text-gray-600'>Join as a Student</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Student Account</CardTitle>
            <CardDescription>
              Start your learning journey with personalized tutoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='name'>Full Name</Label>
                <Input
                  id='name'
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className='mt-1'
                  placeholder='Enter your full name'
                />
              </div>

              <div>
                <Label htmlFor='email'>Email address</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='mt-1'
                  placeholder='Enter your email'
                />
              </div>

              <div>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  type='tel'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className='mt-1'
                  placeholder='Your phone number'
                />
              </div>

              <div>
                <Label htmlFor='grade'>Grade/Level</Label>
                <Input
                  id='grade'
                  type='text'
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className='mt-1'
                  placeholder='e.g., Grade 10, College Freshman'
                />
              </div>

              <div>
                <Label htmlFor='subjects'>Subjects You're Interested In</Label>
                {subjectsLoading ? (
                  <div className='mt-1 p-3 border rounded-md bg-gray-50 text-gray-500'>
                    Loading subjects...
                  </div>
                ) : (
                  <div className='mt-1 space-y-2'>
                    {/* Selected Subjects */}
                    {selectedSubjects.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {selectedSubjects.map((subjectName) => {
                          const subject = subjects.find(s => s.name === subjectName);
                          return (
                            <Badge 
                              key={subjectName} 
                              className={`${getCategoryColor(subject?.category || 'Other')} flex items-center gap-1`}
                            >
                              {subjectName}
                              <button
                                type='button'
                                onClick={() => removeSubject(subjectName)}
                                className='ml-1 hover:bg-black/10 rounded-full p-0.5'
                              >
                                <X className='h-3 w-3' />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Available Subjects */}
                    <div className='border rounded-md p-3 max-h-40 overflow-y-auto'>
                      <p className='text-sm text-gray-600 mb-2'>Click to select subjects:</p>
                      <div className='space-y-1'>
                        {subjects
                          .filter(subject => !selectedSubjects.includes(subject.name))
                          .map((subject) => (
                            <button
                              key={subject._id}
                              type='button'
                              onClick={() => addSubject(subject.name)}
                              className='w-full text-left p-2 hover:bg-gray-100 rounded-md flex items-center justify-between'
                            >
                              <span className='font-medium'>{subject.name}</span>
                              <Badge className={getCategoryColor(subject.category)}>
                                {subject.category}
                              </Badge>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className='mt-1'
                  placeholder='Create a strong password'
                />
              </div>

              <div>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className='mt-1'
                  placeholder='Confirm your password'
                />
              </div>

              <Button 
                type='submit' 
                className='w-full' 
                disabled={loading || selectedSubjects.length === 0}
              >
                {loading ? 'Creating account...' : 'Create Student Account'}
              </Button>
            </form>

            <div className='mt-4 text-center space-y-2'>
              <p className='text-sm text-gray-600'>
                Want to teach instead?{' '}
                <Link
                  to='/register/tutor'
                  className='text-blue-600 hover:text-blue-500'
                >
                  Join as Tutor
                </Link>
              </p>
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link to='/login' className='text-blue-600 hover:text-blue-500'>
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterStudent;
