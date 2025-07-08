import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Eye, Shield, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { getStudyMaterials } from '@/services/api';

const StudyMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await getStudyMaterials(token || '');
        setMaterials(res.data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to fetch study materials'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === 'all' || material.subject === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  const getFileTypeIcon = (fileType: string) => {
    return <FileText className='h-4 w-4' />;
  };

  const subjects = [...new Set(materials.map((m) => m.subject))];

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Loading study materials...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-red-500'>Error loading study materials: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold mb-2'>Study Materials</h1>
          <p className='text-gray-600'>
            Access your learning resources and study materials
          </p>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <Input
              placeholder='Search materials or subjects...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by subject' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold'>{materials.length}</div>
              <p className='text-sm text-gray-600'>Total Materials</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-blue-600'>
                {subjects.length}
              </div>
              <p className='text-sm text-gray-600'>Subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-green-600'>
                {materials.filter((m) => m.fileType === 'pdf').length}
              </div>
              <p className='text-sm text-gray-600'>PDF Files</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-purple-600'>
                Protected
              </div>
              <p className='text-sm text-gray-600'>View Only</p>
            </CardContent>
          </Card>
        </div>

        {/* Materials Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center space-x-2'>
                    {getFileTypeIcon(material.fileType)}
                    <Badge variant='outline'>
                      {material.fileType.toUpperCase()}
                    </Badge>
                  </div>
                  <Shield className='h-4 w-4 text-gray-400' />
                </div>
                <CardTitle className='text-lg'>{material.title}</CardTitle>
                <CardDescription>{material.description}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-sm text-gray-600'>
                  <p>📚 Subject: {material.subject}</p>
                  <p>👨‍🏫 Uploaded by: {material.uploadedBy}</p>
                  <p>📅 Date: {material.uploadedAt}</p>
                  <p>📁 File: {material.fileName}</p>
                </div>

                <div className='flex space-x-2'>
                  <Button className='flex-1' disabled>
                    <Eye className='h-4 w-4 mr-2' />
                    View (Protected)
                  </Button>
                  <Button variant='outline' size='sm' disabled>
                    <Download className='h-4 w-4' />
                  </Button>
                </div>

                <div className='text-xs text-gray-500 bg-gray-50 p-2 rounded'>
                  <Shield className='h-3 w-3 inline mr-1' />
                  Content is protected from download and screenshots
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className='text-center py-12'>
            <FileText className='h-12 w-12 mx-auto text-gray-400 mb-4' />
            <p className='text-gray-500 text-lg'>
              No study materials found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudyMaterials;
