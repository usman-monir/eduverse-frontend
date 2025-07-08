
import React, { useState, useEffect } from 'react';
import { ClassSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Link as LinkIcon } from 'lucide-react';

interface SessionFormProps {
  session?: ClassSession;
  onSubmit: (sessionData: Omit<ClassSession, 'id'>) => void;
  onCancel: () => void;
}

const SessionForm = ({ session, onSubmit, onCancel }: SessionFormProps) => {
  const [formData, setFormData] = useState<{
    subject: string;
    tutor: string;
    date: string;
    time: string;
    duration: string;
    status: 'available' | 'booked' | 'completed';
    studentId: string;
    meetingLink: string;
    description: string;
  }>({
    subject: '',
    tutor: '',
    date: '',
    time: '',
    duration: '60 minutes',
    status: 'available',
    studentId: '',
    meetingLink: '',
    description: ''
  });

  useEffect(() => {
    if (session) {
      setFormData({
        subject: session.subject,
        tutor: session.tutor,
        date: session.date,
        time: session.time,
        duration: session.duration,
        status: session.status,
        studentId: session.studentId || '',
        meetingLink: session.meetingLink || '',
        description: session.description || ''
      });
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generateMeetingLink = () => {
    const meetingId = Math.random().toString(36).substring(2, 12);
    setFormData(prev => ({
      ...prev,
      meetingLink: `https://meet.google.com/${meetingId}`
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g., Mathematics, Physics"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="tutor">Tutor</Label>
          <Input
            id="tutor"
            value={formData.tutor}
            onChange={(e) => setFormData(prev => ({ ...prev, tutor: e.target.value }))}
            placeholder="Tutor name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30 minutes">30 minutes</SelectItem>
              <SelectItem value="60 minutes">60 minutes</SelectItem>
              <SelectItem value="90 minutes">90 minutes</SelectItem>
              <SelectItem value="120 minutes">120 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'available' | 'booked' | 'completed') => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="studentId">Student ID (optional)</Label>
          <Input
            id="studentId"
            value={formData.studentId}
            onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
            placeholder="Student ID if booked"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="meetingLink">Google Meet Link</Label>
        <div className="flex space-x-2">
          <Input
            id="meetingLink"
            value={formData.meetingLink}
            onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
            placeholder="https://meet.google.com/..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={generateMeetingLink}
            className="flex-shrink-0"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Additional notes about the session"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {session ? 'Update Session' : 'Create Session'}
        </Button>
      </div>
    </form>
  );
};

export default SessionForm;
