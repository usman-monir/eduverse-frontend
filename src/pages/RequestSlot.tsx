import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { getAvailableTutors, createSessionSlotRequest } from "@/services/api";

import {
  CalendarDays,
  Clock,
  User,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const RequestSlot = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedTutorObj, setSelectedTutorObj] = useState<any | null>(null);
  const [hasBookingToday, setHasBookingToday] = useState(false);
  const [bookingValidationLoading, setBookingValidationLoading] =
    useState(false);

  // Mock toast function - replace with your actual toast implementation
  const toast = (options: any) => {
    console.log("Toast:", options);
    alert(options.description || options.title);
  };

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const response = await getAvailableTutors();
        setTutors(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch tutors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  // Generate available time slots (10 AM to 3 PM for 2-hour sessions)
  const generateAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push(time);
    }
    return slots;
  };

  // Check if user has booking on selected date
  const checkUserBookingForDate = async (date) => {
    if (!date) return false;

    setBookingValidationLoading(true);
    try {
      const dateStr = date.toISOString().split("T")[0];
      // Replace with your actual API endpoint
      const response = await fetch(`/api/user/bookings?date=${dateStr}`);
      const data = await response.json();

      const hasBooking = data.bookings && data.bookings.length > 0;
      setHasBookingToday(hasBooking);
      return hasBooking;
    } catch (error) {
      console.error("Error checking user bookings:", error);
      return false;
    } finally {
      setBookingValidationLoading(false);
    }
  };

  // Check bookings when date changes
  useEffect(() => {
    if (selectedDate) {
      checkUserBookingForDate(selectedDate);
    }
  }, [selectedDate]);

  // Update subjects when selectedTutor changes
  useEffect(() => {
    if (!selectedTutor) {
      setSubjects([]);
      setSelectedTutorObj(null);
      setSubject("");
      return;
    }
    const tutor = tutors.find((t) => t.email === selectedTutor);
    setSelectedTutorObj(tutor || null);
    if (tutor && Array.isArray(tutor.subjects)) {
      setSubjects(tutor.subjects);
      if (!tutor.subjects.includes(subject)) {
        setSubject("");
      }
    } else {
      setSubjects([]);
      setSubject("");
    }
  }, [selectedTutor, tutors, subject]);

  const handleSubmitRequest = async () => {
    if (!selectedDate || !selectedTutor || !selectedTime || !subject) {
      toast({
        title: "Please fill all required fields",
        description:
          "Date, tutor, time, and subject are required to submit a request.",
        variant: "destructive",
      });
      return;
    }

    if (hasBookingToday) {
      toast({
        title: "Booking Limit Reached",
        description: "You can only book one session per day.",
        variant: "destructive",
      });
      return;
    }

    // Check 12-hour advance requirement
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(parseInt(selectedTime.split(":")[0]), 0, 0, 0);
    const now = new Date();
    const timeDiff = slotDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    setLoading(true);
    try {
      await createSessionSlotRequest({
        type: "slot_request",
        subject,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        duration: "120", // 2 hours
        description: message || "2-hour session request",
        tutorId: selectedTutorObj?._id,
      });

      toast({
        title: "2-Hour Session Request Submitted!",
        description: "Your request has been sent to the tutor for approval.",
      });

      // Reset form
      setSelectedDate(new Date());
      setSelectedTutor("");
      setSelectedTime("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Request failed",
        description:
          error.response?.data?.message ||
          "Could not submit slot request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Request a 2-Hour Session</h1>
          <p className="text-gray-600">
            Request a custom 2-hour session with your preferred tutor at your
            preferred time
          </p>
        </div>

        {/* Important Notice */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-800">
                  Important Booking Rules
                </h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>
                    • All sessions are <strong>2 hours long</strong>
                  </li>
                  <li>
                    • You can book <strong>only one session per day</strong>
                  </li>
                  <li>
                    • Sessions must be booked{" "}
                    <strong>at least 12 hours in advance</strong>
                  </li>
                  <li>
                    • Available time slots:{" "}
                    <strong>10 AM - 3 PM (Monday to Saturday)</strong>
                  </li>
                  <li>
                    • Tutor will approve/reject your request within 24 hours
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Session Request Form</span>
              </CardTitle>
              <CardDescription>
                Fill out the form below to request your 2-hour session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tutor Selection */}
              <div>
                <Label htmlFor="tutor">Select Tutor *</Label>
                <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.email} value={tutor.email}>
                        {tutor.name} ({tutor.email})
                        {tutor.experience && ` — ${tutor.experience}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={subject}
                  onValueChange={setSubject}
                  disabled={!selectedTutor}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedTutor
                          ? "Select subject"
                          : "Select a tutor first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Selection */}
              <div>
                <Label htmlFor="time">Preferred Time *</Label>
                <Select
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                  disabled={!selectedDate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateAvailableTimeSlots().map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)} -{" "}
                        {formatTime(
                          (parseInt(time.split(":")[0]) + 2)
                            .toString()
                            .padStart(2, "0") + ":00"
                        )}{" "}
                        (2 hours)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Display */}
              <div>
                <Label>Session Duration</Label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">2 hours (fixed)</span>
                </div>
              </div>

              {/* Booking Limit Warning */}
              {hasBookingToday && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 text-sm">
                    You already have a booking on this date. Only one session
                    per day is allowed.
                  </span>
                </div>
              )}

              {/* Additional Message */}
              <div>
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  placeholder="Enter any specific requirements or notes for your 2-hour session..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitRequest}
                className="w-full"
                disabled={loading || hasBookingToday}
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Submitting..." : "Submit 2-Hour Session Request"}
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarDays className="h-5 w-5" />
                <span>Select Date</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred date for the 2-hour session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  // Disable past dates only
                  if (date < today) return true;

                  // Disable Sundays
                  return date.getDay() === 0;
                }}
                modifiers={{
                  hasBooking: (date) =>
                    hasBookingToday &&
                    selectedDate?.toDateString() === date.toDateString(),
                }}
                modifiersStyles={{
                  hasBooking: {
                    backgroundColor: "#fecaca",
                    color: "#dc2626",
                    fontWeight: "bold",
                  },
                }}
              />

              {/* Booking Status */}
              {selectedDate && (
                <div className="mt-4">
                  {bookingValidationLoading ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-600">
                        Checking bookings...
                      </p>
                    </div>
                  ) : hasBookingToday ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Booking Limit Reached
                      </p>
                      <p className="text-xs text-red-700">
                        You already have a session booked on this date
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Date Available
                      </p>
                      <p className="text-xs text-green-700">
                        You can request a 2-hour session on this date
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">
              <CheckCircle2 className="h-5 w-5 inline mr-2" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Request Process:</h4>
                <ul className="space-y-1">
                  <li>• Fill out the form with your preferences</li>
                  <li>• Choose any available time slot</li>
                  <li>• Submit your 2-hour session request</li>
                  <li>• Wait for tutor approval (within 24 hours)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Important Notes:</h4>
                <ul className="space-y-1">
                  <li>• Sessions are exactly 2 hours long</li>
                  <li>• One session per day maximum</li>
                  <li>• 12-hour advance booking required</li>
                  <li>• No sessions on Sundays</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RequestSlot;
