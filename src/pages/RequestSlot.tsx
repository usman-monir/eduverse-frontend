
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Calendar as CalendarIcon, Clock, User, Send } from 'lucide-react';

const RequestSlot = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTutor, setSelectedTutor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const tutors = [
    'Dr. Smith',
    'Prof. Johnson', 
    'Dr. Wilson',
    'Ms. Davis',
    'Mr. Brown'
  ];

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const durations = [
    '30 minutes',
    '1 hour',
    '1.5 hours',
    '2 hours'
  ];

  const handleSubmitRequest = () => {
    if (!selectedDate || !selectedTutor || !selectedTime || !duration || !subject) {
      toast({
        title: "Please fill all required fields",
        description: "All fields except message are required to submit a request.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Slot request submitted successfully!",
      description: "Your request has been sent to the admin for approval. You'll receive an email confirmation once approved.",
    });

    // Reset form
    setSelectedDate(new Date());
    setSelectedTutor('');
    setSelectedTime('');
    setDuration('');
    setSubject('');
    setMessage('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Request a Time Slot</h1>
          <p className="text-gray-600">Submit a request for your preferred class schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Select Tutor & Subject</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tutor">Preferred Tutor *</Label>
                  <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map(tutor => (
                        <SelectItem key={tutor} value={tutor}>{tutor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subj => (
                        <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Time & Duration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="time">Preferred Time *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map(dur => (
                        <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Message</CardTitle>
                <CardDescription>Any specific requirements or notes for your session</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter any additional details or special requests..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Button onClick={handleSubmitRequest} className="w-full" size="lg">
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </div>

          {/* Calendar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Select Date *</span>
                </CardTitle>
                <CardDescription>Choose your preferred date for the session</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
                
                {selectedDate && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Selected Date</h4>
                    <p className="text-blue-600">{selectedDate.toDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Request Summary */}
            {(selectedTutor || selectedTime || subject) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Request Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {selectedTutor && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tutor:</span>
                        <span className="font-medium">{selectedTutor}</span>
                      </div>
                    )}
                    {subject && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subject:</span>
                        <span className="font-medium">{subject}</span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">{selectedDate.toDateString()}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                    )}
                    {duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">{duration}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Request Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <ul className="space-y-2 text-sm">
              <li>• Requests will be reviewed by our admin team within 24 hours</li>
              <li>• You'll receive an email notification once your request is approved or needs modification</li>
              <li>• Approved sessions will automatically appear in your dashboard with meeting links</li>
              <li>• Please submit requests at least 48 hours in advance</li>
              <li>• You can track the status of your requests in your dashboard</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RequestSlot;
