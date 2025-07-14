
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { BookOpen } from 'lucide-react';

const Courses = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
          <p className="text-gray-600">Access your learning resources and materials</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Updated Learning System
            </CardTitle>
            <CardDescription>
              We've updated our learning system to focus on study materials instead of traditional courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">New Study Materials System</h3>
              <p className="text-gray-600 mb-4">
                Access all your learning materials in one centralized location. Materials are protected 
                and can be viewed but not downloaded or screenshotted by students.
              </p>
              <Link to="/study-materials">
                <Button>
                  Access Study Materials
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
