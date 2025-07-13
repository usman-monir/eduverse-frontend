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

interface SessionFormProps {
  session?: ClassSession;
  onSubmit: (sessionData: Omit<ClassSession, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  const [formData, setFormData] = useState<{
    subject: string;
    tutor: string;
    tutorId?: string;
    date: string;
    time: string;
    duration: string;
    status: 'available' | 'booked' | 'completed' | 'pending' | 'approved' | 'cancelled';
    studentId: string;
    meetingLink: string;
    description: string;
    type: 'admin_created' | 'tutor_created' | 'slot_request';
  }>({
    subject: '',
    tutor: defaultTutor || '',
    tutorId: '',
    date: '',
    time: '',
    duration: '60 minutes',
    status: 'available',
    studentId: '',
    meetingLink: '',
    description: '',
    type: 'admin_created',
  });

  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [selectedTutorSubjects, setSelectedTutorSubjects] = useState<string[]>([]);

  // Fetch available tutors if admin or tutor
  useEffect(() => {
    if (isAdmin || isTutor) {
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
  }, [isAdmin, isTutor]);

  // Pre-select tutor for tutors after tutors are loaded
  useEffect(() => {
    if (isTutor && availableTutors.length > 0 && defaultTutor) {
      const currentTutor = availableTutors.find(t => t.name === defaultTutor);
      if (currentTutor) {
        setFormData((prev) => ({
          ...prev,
          tutor: currentTutor.name,
          tutorId: currentTutor._id,
          type: 'tutor_created',
        }));
      }
    }
  }, [isTutor, availableTutors, defaultTutor]);

  // Update subjects when tutor changes
  useEffect(() => {
    if ((isAdmin || isTutor) && formData.tutorId) {
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
  }, [formData.tutorId, availableTutors, isAdmin, isTutor]);

  useEffect(() => {
    if (session) {
      setFormData({
        subject: session.subject,
        tutor: session.tutor,
        tutorId: session.tutorId || '',
        date: session.date ? session.date.slice(0, 10) : '',
        time: session.time,
        duration: session.duration,
        status: session.status,
        studentId: session.studentId || '',
        meetingLink: session.meetingLink || '',
        description: session.description || '',
        type: session.type,
      });
    } else if (defaultTutor && isAdmin) {
      // For admin, optionally pre-fill tutor name
      setFormData((prev) => ({ ...prev, tutor: defaultTutor, type: 'admin_created' }));
    }
  }, [session, defaultTutor, isAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure tutorId is always provided
    const submissionData = {
      ...formData,
      tutorId: formData.tutorId || '',
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
    const requiredFields = ['subject', 'tutor', 'date', 'time', 'duration'];
    const hasRequiredFields = requiredFields.every(field => 
      formData[field as keyof typeof formData] && 
      formData[field as keyof typeof formData] !== ''
    );
    
    // For admin or tutor, also check if tutor is selected
    if (isAdmin || isTutor) {
      return hasRequiredFields && formData.tutorId;
    }
    
    return hasRequiredFields;
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='tutor'>Tutor</Label>
          {(isAdmin || isTutor) ? (
            <Select
              value={formData.tutorId || ''}
              onValueChange={(value) => {
                if (isTutor) return; // Prevent changing tutor for tutors
                const selectedTutor = availableTutors.find(t => t._id === value);
                setFormData((prev) => ({ 
                  ...prev, 
                  tutorId: value,
                  tutor: selectedTutor?.name || '',
                  subject: '' // Clear subject when tutor changes
                }));
              }}
              disabled={loadingTutors || isTutor} // Disable for tutors
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTutors ? "Loading tutors..." : isTutor ? formData.tutor : "Select a tutor"} />
              </SelectTrigger>
              <SelectContent>
                {availableTutors.map((tutor) => (
                  <SelectItem key={tutor._id} value={tutor._id}>
                    {tutor.name} ({tutor.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
          <Input
            id='tutor'
            value={formData.tutor}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tutor: e.target.value }))
            }
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
                  disabled={!formData.tutorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!formData.tutorId ? "Select tutor first" : "Select subject"} />
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
                  placeholder='Enter subject manually (tutor has no subjects defined)'
                  required
                />
              )}
              {formData.tutorId && selectedTutorSubjects.length === 0 && (
                <p className='text-sm text-amber-600'>
                  ⚠️ Selected tutor has no subjects defined. Please enter subject manually.
                </p>
              )}
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
            onValueChange={(value: 'available' | 'booked' | 'completed') =>
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
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='studentId'>Student ID (optional)</Label>
          <Input
            id='studentId'
            value={formData.studentId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, studentId: e.target.value }))
            }
            placeholder='Student ID if booked'
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
