import React, { useState } from 'react';
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
import { GraduationCap } from 'lucide-react';

const RegisterStudent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('');
  const [subjects, setSubjects] = useState(''); // comma-separated string
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone,
        grade,
        subjects: subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      navigate('/dashboard');
      toast({
        title: 'Registration successful',
        description: 'Welcome to EduPortal! Start your learning journey.',
      });
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
                <Label htmlFor='subjects'>Subjects</Label>
                <Input
                  id='subjects'
                  type='text'
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className='mt-1'
                  placeholder='e.g., Math, Science'
                  required
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
