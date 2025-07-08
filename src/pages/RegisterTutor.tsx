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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { BookOpen } from 'lucide-react';

const RegisterTutor = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [subjects, setSubjects] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
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
        role: 'tutor',
        subjects: subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experience,
        qualifications: qualification,
      });
      navigate('/tutor-dashboard');
      toast({
        title: 'Registration successful',
        description:
          'Welcome to EduPortal! Start teaching and inspiring students.',
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
                <Input
                  id='subjects'
                  type='text'
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className='mt-1'
                  placeholder='e.g., Mathematics, Physics, Chemistry'
                />
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
                <Textarea
                  id='bio'
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className='mt-1'
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
