
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { BookOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCourses = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Study Materials Management</h1>
            <p className="text-gray-600">Upload and manage study materials for students</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Material
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Study Materials System
            </CardTitle>
            <CardDescription>
              This section has been updated to focus on study materials management instead of courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Study Materials Hub</h3>
              <p className="text-gray-600 mb-4">
                Upload and manage protected study materials that students can view but not download or screenshot.
              </p>
              <Link to="/study-materials">
                <Button>
                  Go to Study Materials
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;
