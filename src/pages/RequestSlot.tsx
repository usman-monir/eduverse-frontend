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

  // Updated generateAvailableTimeSlots function
  const generateAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      // Add hour slot (e.g., 10:00)
      const hourTime = `${hour.toString().padStart(2, "0")}:00`;
      slots.push(hourTime);

      // Add half-hour slot (e.g., 10:30)
      const halfHourTime = `${hour.toString().padStart(2, "0")}:30`;
      slots.push(halfHourTime);
    }
    return slots;
  };

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
        duration: "60",
        description: message || "1-hour session request",
        tutorId: selectedTutorObj?._id,
      });

      toast({
        title: "1-Hour Session Request Submitted!",
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Request a 1-Hour Session
          </h1>
          <p className="text-gray-600">
            Request a custom 1-hour session with your preferred tutor at your
            preferred time
          </p>
        </div>

        {/* Important Notice */}
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-800">
                  Important Booking Rules
                </h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>
                    • All sessions are <strong>1 hour long</strong>
                  </li>
                  <li>
                    • You can book <strong>only one session per day</strong>
                  </li>
                  <li>
                    • Available days: <strong>Sunday to Friday</strong>
                  </li>
                  <li>
                    • Tutor will approve/reject your request within 24 hours
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Session Request Form</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below to request your 1-hour session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tutor Selection */}
                  <div>
                    <Label
                      htmlFor="tutor"
                      className="text-sm font-medium text-gray-700"
                    >
                      Select Tutor *
                    </Label>
                    <Select
                      value={selectedTutor}
                      onValueChange={setSelectedTutor}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label
                      htmlFor="subject"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subject *
                    </Label>
                    <Select
                      value={subject}
                      onValueChange={setSubject}
                      disabled={!selectedTutor}
                    >
                      <SelectTrigger className="mt-1">
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
                </div>

                {/* Time Selection */}
                <div>
                  <Label
                    htmlFor="time"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select Your Preferred Time *
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-500">
                        Start Time
                      </Label>
                      <Select
                        value={selectedTime}
                        onValueChange={setSelectedTime}
                        disabled={!selectedDate}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateAvailableTimeSlots().map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">
                        End Time (Auto-calculated)
                      </Label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {selectedTime
                            ? (() => {
                                const [hours, minutes] =
                                  selectedTime.split(":");
                                const startHour = parseInt(hours);
                                const startMinutes = parseInt(minutes);

                                // Calculate end time (1 hour later)
                                let endHour = startHour + 1;
                                let endMinutes = startMinutes;

                                // Handle overflow for minutes (shouldn't happen with 1 hour sessions)
                                if (endMinutes >= 60) {
                                  endHour += 1;
                                  endMinutes -= 60;
                                }

                                // Handle 24-hour overflow
                                if (endHour >= 24) {
                                  endHour = endHour - 24;
                                }

                                const endTime = `${endHour
                                  .toString()
                                  .padStart(2, "0")}:${endMinutes
                                  .toString()
                                  .padStart(2, "0")}`;
                                return formatTime(endTime);
                              })()
                            : "Select start time first"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Session duration is fixed at 1 hour
                  </p>
                </div>
                {/* Duration Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="text-sm font-semibold text-blue-900">
                        Session Duration: 1 Hour (Fixed)
                      </span>
                      <p className="text-xs text-blue-700 mt-1">
                        All sessions are exactly 60 minutes long
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Limit Warning */}
                {hasBookingToday && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-red-700 text-sm font-medium">
                        Booking Limit Reached
                      </span>
                      <p className="text-red-600 text-xs mt-1">
                        You already have a booking on this date. Only one
                        session per day is allowed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Message */}
                <div>
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700"
                  >
                    Additional Message (Optional)
                  </Label>
                  <Textarea
                    placeholder="Enter any specific requirements or notes for your 1-hour session..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitRequest}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium"
                  disabled={loading || hasBookingToday}
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Submitting..." : "Submit 1-Hour Session Request"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar */}
          <div>
            <Card className="shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  <span>Select Date</span>
                </CardTitle>
                <CardDescription>
                  Choose your preferred date for the 1-hour session
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      // Disable past dates only
                      if (date < today) return true;

                      // Disable Saturdays (day 6)
                      return date.getDay() === 6;
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
                </div>

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
                          You can request a 1-hour session on this date
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Guidelines */}
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-800">
              <CheckCircle2 className="h-5 w-5 inline mr-2" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold mb-2 text-blue-900">
                  Request Process:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Fill out the form with your preferences</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Choose your preferred start time</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Submit your 1-hour session request</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Wait for tutor approval (within 24 hours)</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold mb-2 text-blue-900">
                  Important Notes:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      Sessions are exactly <strong>1 hour long</strong>
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      <strong>One session per day</strong> maximum
                    </span>
                  </li>

                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      No sessions on <strong>Saturdays</strong>
                    </span>
                  </li>
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
