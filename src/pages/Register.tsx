
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Users } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">Score Smart LMS</h1>
          <p className="text-gray-600 text-lg">Choose how you want to join our learning community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Registration */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-4 rounded-full">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-blue-600">Join as Student</CardTitle>
              <CardDescription className="text-base">
                Start your learning journey with personalized tutoring and study materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">What you get:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Access to qualified tutors</li>
                  <li>• Protected study materials</li>
                  <li>• One-on-one sessions</li>
                  <li>• Progress tracking</li>
                  <li>• 24/7 messaging support</li>
                </ul>
              </div>
              <Link to="/register/student" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Register as Student
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tutor Registration */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-600 p-4 rounded-full">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">Join as Tutor</CardTitle>
              <CardDescription className="text-base">
                Share your knowledge and help students achieve their academic goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">What you can do:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Teach students online</li>
                  <li>• Upload study materials</li>
                  <li>• Manage your sessions</li>
                  <li>• Set your availability</li>
                  <li>• Track student progress</li>
                </ul>
              </div>
              <Link to="/register/tutor" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Register as Tutor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-500 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
