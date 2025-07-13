import React, { useState, useEffect } from 'react';
import { ClassSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link as LinkIcon } from 'lucide-react';
import { getAvailableTutors } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface SessionFormProps {
  session?: ClassSession;
  onSubmit: (sessionData: any) => void;
  onCancel: () => void;
  defaultTutor?: string;
  isAdmin?: boolean;
  isTutor?: boolean;
}

const SessionForm = ({
  session,
  onSubmit,
  onCancel,
  defaultTutor,
  isAdmin = false,
  isTutor = false,
}: SessionFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<{
    subject: string;
    date: string;
    time: string;
    duration: string;
    status: 'available' | 'booked' | 'completed' | 'pending' | 'approved' | 'cancelled';
    description: string;
    meetingLink: string;
    type: 'admin_created' | 'tutor_created' | 'slot_request';
    maxStudents: number;
    tutorId?: string;
  }>({
    subject: '',
    date: '',
    time: '',
    duration: '60 minutes',
    status: 'available',
    description: '',
    meetingLink: '',
    type: 'admin_created',
    maxStudents: 10,
    tutorId: '',
  });

  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [selectedTutorSubjects, setSelectedTutorSubjects] = useState<string[]>([]);

  // Fetch available tutors if admin
  useEffect(() => {
    if (isAdmin) {
      const fetchTutors = async () => {
        setLoadingTutors(true);
        try {
          const response = await getAvailableTutors();
          setAvailableTutors(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch tutors:', error);
        } finally {
          setLoadingTutors(false);
        }
      };
      fetchTutors();
    }
  }, [isAdmin]);

  // For tutors, set their own information and subjects
  useEffect(() => {
    if (isTutor && user) {
      console.log('Setting tutor info:', { user, isTutor });
      setFormData((prev) => ({
        ...prev,
        tutorId: user._id || user.id,
        type: 'tutor_created',
      }));
      
      // Set the tutor's subjects
      if (user.subjects && user.subjects.length > 0) {
        console.log('Setting tutor subjects:', user.subjects);
        setSelectedTutorSubjects(user.subjects);
      } else {
        console.log('No subjects found for tutor');
        setSelectedTutorSubjects([]);
      }
    }
  }, [isTutor, user]);

  // Pre-select tutor for admin after tutors are loaded
  useEffect(() => {
    if (isAdmin && availableTutors.length > 0 && defaultTutor) {
      const tutor = availableTutors.find(t => t.name === defaultTutor);
      if (tutor) {
        setFormData(prev => ({ ...prev, tutorId: tutor._id }));
      }
    }
  }, [isAdmin, availableTutors, defaultTutor]);

  // Update subjects when tutor changes (for admin only)
  useEffect(() => {
    if (isAdmin && formData.tutorId) {
      const selectedTutor = availableTutors.find(t => t._id === formData.tutorId);
      if (selectedTutor && selectedTutor.subjects) {
        setSelectedTutorSubjects(selectedTutor.subjects);
        // Clear subject if it's not in the new tutor's subjects
        if (formData.subject && !selectedTutor.subjects.includes(formData.subject)) {
          setFormData(prev => ({ ...prev, subject: '' }));
        }
      } else {
        setSelectedTutorSubjects([]);
        setFormData(prev => ({ ...prev, subject: '' }));
      }
    }
  }, [formData.tutorId, availableTutors, isAdmin]);

  useEffect(() => {
    if (session) {
      setFormData({
        subject: session.subject || '',
        date: session.date || '',
        time: session.time || '',
        duration: session.duration || '60 minutes',
        status: session.status || 'available',
        description: session.description || '',
        meetingLink: session.meetingLink || '',
        type: session.type,
        maxStudents: session.maxStudents || 10,
        tutorId: session.tutorId || '',
      });
    } else if (defaultTutor && isAdmin) {
      // For admin, set the default tutor
      const tutor = availableTutors.find(t => t.name === defaultTutor);
      if (tutor) {
        setFormData(prev => ({ ...prev, tutorId: tutor._id }));
      }
    }
  }, [session, defaultTutor, isAdmin, availableTutors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      createdBy: isAdmin ? 'admin' : 'tutor'
    };
    
    onSubmit(submissionData);
  };

  const generateMeetingLink = () => {
    const meetingId = Math.random().toString(36).substring(2, 12);
    setFormData((prev) => ({
      ...prev,
      meetingLink: `https://meet.google.com/${meetingId}`,
    }));
  };

  // Validation for form submission
  const isFormValid = () => {
    const requiredFields = ['subject', 'date', 'time', 'duration'];
    const hasRequiredFields = requiredFields.every(field => 
      formData[field as keyof typeof formData] && 
      formData[field as keyof typeof formData] !== ''
    );
    
    // For admin, check if tutor is selected
    if (isAdmin) {
      return hasRequiredFields && formData.tutorId;
    }
    
    // For tutors, they are automatically selected
    return hasRequiredFields;
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='tutor'>Tutor</Label>
          {isAdmin ? (
            <Select
              value={formData.tutorId || ''}
              onValueChange={(value) => {
                setFormData((prev) => ({ 
                  ...prev, 
                  tutorId: value,
                  subject: '' // Clear subject when tutor changes
                }));
              }}
              disabled={loadingTutors}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTutors ? "Loading tutors..." : "Select a tutor"} />
              </SelectTrigger>
              <SelectContent>
                {availableTutors.map((tutor) => (
                  <SelectItem key={tutor._id} value={tutor._id}>
                    {tutor.name} ({tutor.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : isTutor ? (
            <Input
              id='tutor'
              value={user?.name || 'Current User'}
              placeholder='Tutor name'
              required
              readOnly
              className='bg-gray-50'
            />
          ) : (
            <Input
              id='tutor'
              value={defaultTutor || ''}
              placeholder='Tutor name'
              required
              readOnly={!!defaultTutor}
            />
          )}
        </div>

        <div>
          <Label htmlFor='subject'>Subject</Label>
          {(isAdmin || isTutor) ? (
            <div className='space-y-2'>
              {selectedTutorSubjects.length > 0 ? (
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subject: value }))
                  }
                  disabled={isAdmin && !formData.tutorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      isAdmin && !formData.tutorId 
                        ? "Select tutor first" 
                        : isTutor 
                          ? "Select your subject" 
                          : "Select subject"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTutorSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id='subject'
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder={
                    isTutor 
                      ? 'Enter your subject (no subjects defined in profile)' 
                      : 'Enter subject manually (tutor has no subjects defined)'
                  }
                  required
                />
              )}
              {(isAdmin && formData.tutorId && selectedTutorSubjects.length === 0) || 
               (isTutor && selectedTutorSubjects.length === 0) ? (
                <p className='text-sm text-amber-600'>
                  ⚠️ {isTutor ? 'You have no subjects defined in your profile.' : 'Selected tutor has no subjects defined.'} Please enter subject manually.
                </p>
              ) : null}
            </div>
          ) : (
            <Input
              id='subject'
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder='e.g., Mathematics, Physics'
              required
            />
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <Label htmlFor='date'>Date</Label>
          <Input
            id='date'
            type='date'
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <Label htmlFor='time'>Time</Label>
          <Input
            id='time'
            type='time'
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor='duration'>Duration</Label>
          <Select
            value={formData.duration}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, duration: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='30 minutes'>30 minutes</SelectItem>
              <SelectItem value='60 minutes'>60 minutes</SelectItem>
              <SelectItem value='90 minutes'>90 minutes</SelectItem>
              <SelectItem value='120 minutes'>120 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='status'>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'available' | 'booked' | 'completed' | 'pending' | 'approved' | 'cancelled') =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='available'>Available</SelectItem>
              <SelectItem value='booked'>Booked</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='approved'>Approved</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='maxStudents'>Max Students</Label>
          <Input
            id='maxStudents'
            type='number'
            value={formData.maxStudents}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, maxStudents: parseInt(e.target.value) || 10 }))
            }
            placeholder='Maximum number of students'
            min='1'
            max='50'
          />
        </div>
      </div>

      <div>
        <Label htmlFor='meetingLink'>Google Meet Link</Label>
        <div className='flex space-x-2'>
          <Input
            id='meetingLink'
            value={formData.meetingLink}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))
            }
            placeholder='https://meet.google.com/...'
          />
          <Button
            type='button'
            variant='outline'
            onClick={generateMeetingLink}
            className='flex-shrink-0'
          >
            <LinkIcon className='h-4 w-4 mr-2' />
            Generate
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor='description'>Description (optional)</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder='Additional notes about the session'
          rows={3}
        />
      </div>

      <div className='flex justify-end space-x-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={!isFormValid()}>
          {session ? 'Update Session' : 'Create Session'}
        </Button>
      </div>
    </form>
  );
};

export default SessionForm;
