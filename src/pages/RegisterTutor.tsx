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
import { toast } from '@/hooks/use-toast';
import { BookOpen } from 'lucide-react';
import { getSubjects } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const RegisterTutor = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
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
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

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
        description: 'Please select at least one subject you can teach.',
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
        role: 'tutor',
        subjects: selectedSubjects,
        experience,
        qualifications: qualification,
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
      setQualification('');
      setSelectedSubjects([]);
      setExperience('');
      setBio('');
      
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

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='bg-green-600 p-3 rounded-full'>
              <BookOpen className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-4xl font-bold text-green-600 mb-2'>EduPortal</h1>
          <p className='text-gray-600'>Join as a Tutor</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Tutor Account</CardTitle>
            <CardDescription>
              Share your knowledge and help students achieve their goals
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
                <Label htmlFor='qualification'>Highest Qualification</Label>
                <Input
                  id='qualification'
                  type='text'
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className='mt-1'
                  placeholder='e.g., Masters in Mathematics, PhD in Physics'
                />
              </div>

              <div>
                <Label htmlFor='subjects'>Subjects You Teach</Label>
                {loadingSubjects ? (
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
                <Label htmlFor='experience'>Years of Experience</Label>
                <Input
                  id='experience'
                  type='number'
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className='mt-1'
                  placeholder='e.g., 5'
                  min='0'
                />
              </div>

              <div>
                <Label htmlFor='bio'>Brief Bio</Label>
                <textarea
                  id='bio'
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className='mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Tell us about your teaching style and experience...'
                  rows={3}
                />
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

              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? 'Creating account...' : 'Create Tutor Account'}
              </Button>
            </form>

            <div className='mt-4 text-center space-y-2'>
              <p className='text-sm text-gray-600'>
                Want to learn instead?{' '}
                <Link
                  to='/register/student'
                  className='text-green-600 hover:text-green-500'
                >
                  Join as Student
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

export default RegisterTutor;
