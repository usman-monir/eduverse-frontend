import React, { useState, useEffect } from "react";
import { format, addHours, isAfter, isSameDay, parseISO } from "date-fns";
import {
  getSessions,
  createSessionSlotRequest,
  getTutorAvailability,
  bookSession,
  getMySessions,
} from "@/services/api";
import axios from "axios";

import { addDays } from "date-fns";
import { isBefore } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Calendar as CalendarIcon, Clock, User, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const BookSession = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTutor, setSelectedTutor] = useState("all");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedDateSessions, setSelectedDateSessions] = useState<any[]>([]);
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short", // "Dec"
      day: "2-digit", // "12"
      year: "numeric", // "2025"
    });
  };
  // Fetch sessions function
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSessions({ limit: 1000 });
      setSessions(res.data.data || []);
      console.log("Fetched sessions:", res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's existing bookings
  const fetchUserBookings = async () => {
    try {
      const response = await getMySessions();
      setUserBookings(response.data || []);
      console.log("Fetched user bookings:", response.data);
    } catch (error) {
      console.error("Failed to fetch user bookings:", error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchSessions(), fetchUserBookings()]);
    };
    initializeData();
  }, []);

  // Helper function to check if session is at least 12 hours ahead

  const isSessionAvailable = (sessionDate: string, sessionTime: string) => {
    try {
      const sessionDateObj = new Date(sessionDate); // e.g. 2025-07-18T06:00:00.000Z
      const [hour, minute] = sessionTime.split(":").map(Number);
      sessionDateObj.setHours(hour, minute, 0, 0);

      const nowPlus12Hours = addHours(new Date(), 12);
      return isAfter(sessionDateObj, nowPlus12Hours);
    } catch (error) {
      console.error("Invalid session time or date:", sessionDate, sessionTime);
      return false;
    }
  };

  // Group sessions by date and tutor, excluding booked sessions
  const sessionsByDateAndTutor = sessions.reduce((acc, session) => {
    if (session.status === "available") {
      const dateKey = new Date(session.date).toDateString();
      const tutorName = session.tutorName || session.tutor;

      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      if (!acc[dateKey][tutorName]) {
        acc[dateKey][tutorName] = [];
      }
      acc[dateKey][tutorName].push(session);
    }
    return acc;
  }, {} as Record<string, Record<string, any[]>>);

  const bookedDatesSet = new Set(
    (userBookings?.data || []).map((booking) =>
      new Date(booking.date).toDateString()
    )
  );
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const getAvailableSessionsForDate = (date: Date) => {
    const now = new Date();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const dateKey = targetDate.toDateString();
    const tutorSessions = sessionsByDateAndTutor[dateKey] || {};

    // If user already has a booking on this day, return []
    if (bookedDatesSet.has(dateKey)) {
      return [];
    }

    const isToday = new Date().toDateString() === targetDate.toDateString();

    const availableSessions = Object.entries(tutorSessions).flatMap(
      ([tutorName, sessions]) =>
        sessions.filter((session) => {
          const isFutureTime = isAfter(
            new Date(`${session.date}T${session.time}`),
            now
          );

          if (isToday) {
            return session.isTodayInviteTriggered === true && isFutureTime;
          } else {
            return isSessionAvailable(session.date, session.time);
          }
        })
    );

    return availableSessions;
  };

  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return; // Prevent reacting to double-clicks or undefined dates

    console.log("Date selected:", date);
    setSelectedDate(date);

    const availableSessions = getAvailableSessionsForDate(date);
    console.log("Available sessions for date:", availableSessions);
    setSelectedDateSessions(availableSessions);
  };

  // Get tutors with sessions for a specific date
  const getTutorsForDate = (date: Date) => {
    const dateKey = date.toDateString();
    const tutorSessions = sessionsByDateAndTutor[dateKey] || {};
    return Object.keys(tutorSessions);
  };

  // Get session count for a date
  const getSessionCountForDate = (date: Date) => {
    const dateKey = date.toDateString();
    const tutorSessions = sessionsByDateAndTutor[dateKey] || {};
    return Object.values(tutorSessions).flat().length;
  };

  // Check if date has available sessions
  const hasAvailableSessionsOnDate = (date: Date) => {
    const availableSessions = getAvailableSessionsForDate(date);
    return availableSessions.length > 0;
  };

  // Custom calendar day renderer with tutor indicators
  const renderCalendarDay = (day: Date) => {
    const tutors = getTutorsForDate(day);
    const sessionCount = getSessionCountForDate(day);
    const hasAvailable = hasAvailableSessionsOnDate(day);

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
        <span className={`text-sm ${hasAvailable ? "font-semibold" : ""}`}>
          {day.getDate()}
        </span>

        {tutors.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-1 max-w-full">
            {tutors.slice(0, 2).map((tutor, index) => (
              <div
                key={tutor}
                className={`w-2 h-2 rounded-full ${
                  hasAvailable ? "bg-green-500" : "bg-gray-400"
                }`}
                title={tutor}
              />
            ))}
            {tutors.length > 2 && (
              <div
                className="w-2 h-2 rounded-full bg-blue-500"
                title={`+${tutors.length - 2} more tutors`}
              />
            )}
          </div>
        )}

        {sessionCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <Badge
              className={`text-xs px-1 py-0.5 min-w-[16px] h-[16px] flex items-center justify-center ${
                hasAvailable
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white"
              }`}
            >
              {sessionCount}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const isTodaySession = (sessionDateStr: string) => {
    const today = new Date().toDateString();
    const sessionDate = new Date(sessionDateStr).toDateString();
    return today === sessionDate;
  };

  // Filter sessions based on current filters
  const getFilteredSessions = (sessions: any[]) => {
    return sessions.filter((session) => {
      const matchesSubject =
        selectedSubject === "all" || session.subject === selectedSubject;
      const matchesTutor =
        selectedTutor === "all" ||
        (session.tutorName || session.tutor) === selectedTutor;
      return matchesSubject && matchesTutor;
    });
  };

  // Group sessions by tutor for display
  const groupSessionsByTutor = (sessions: any[]) => {
    return sessions.reduce((acc, session) => {
      const tutorName = session.tutorName || session.tutor;
      if (!acc[tutorName]) {
        acc[tutorName] = [];
      }
      acc[tutorName].push(session);
      return acc;
    }, {} as Record<string, any[]>);
  };

  // Get unique subjects and tutors from available sessions only
  const subjects = [
    ...new Set(
      sessions
        .filter((session) => session.status === "available")
        .map((session) => session.subject)
    ),
  ];

  const tutors = [
    ...new Set(
      sessions
        .filter((session) => session.status === "available")
        .map((session) => session.tutorName || session.tutor)
    ),
  ];

  // Create a map of dates with available sessions
  const sessionsByDate = sessions.reduce((acc, session) => {
    if (session.status === "available") {
      const dateKey = new Date(session.date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
    }
    return acc;
  }, {} as Record<string, any[]>);

  // Get dates with available sessions for calendar highlighting
  const datesWithSessions = Object.keys(sessionsByDate).map(
    (dateStr) => new Date(dateStr)
  );

  const createMeetingLink = async (startTime: string, endTime: string) => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const selectedDate = startTime.split("T")[0];
      const selectedTime = new Date(startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const localDateTimeString = new Date(startTime).toLocaleString();

      const meetRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/create-meeting`,
        {
          startTime,
          endTime,
          timeZone,
          selectedDate,
          selectedTime,
          localDateTimeString,
        }
      );

      return meetRes.data.meetLink;
    } catch (error) {
      console.error("Error creating meeting:", error);
      return null;
    }
  };

  // Handle book session
  // Handle book session
  const handleBookSession = async (sessionId: string) => {
    try {
      console.log("Booking session with ID:", sessionId);
      if (!sessionId || sessionId === "undefined") {
        throw new Error("Invalid session ID");
      }

      const response = await bookSession(sessionId, {});

      // Show success message with meeting link if available
      toast({
        title: "Class booked successfully!",
        description: response.data?.meetingLink
          ? "You will receive a confirmation email shortly. Meeting link has been generated!"
          : "You will receive a confirmation email shortly.",
      });

      // Optional: You can also show the meeting link immediately
      if (response.data?.meetingLink) {
        console.log("Meeting link generated:", response.data.meetingLink);
        // You could show a modal or additional toast with the meeting link
        // Or redirect to a page that shows the booking details including the meeting link
      }

      // Refresh data after booking
      await Promise.all([fetchSessions(), fetchUserBookings()]);
    } catch (err: any) {
      console.error("Booking error:", err);
      toast({
        title: "Booking failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "Could not book the session.",
        variant: "destructive",
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "booked":
        return <Badge className="bg-blue-100 text-blue-800">Booked</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <span className="text-lg">Loading sessions...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error loading sessions: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Book a Session</h1>
            <p className="text-gray-600">
              Select a date and filter sessions by subject or tutor to find your
              perfect slot
            </p>
          </div>

          <Link to="/request-slot">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Request Custom Slot
            </Button>
          </Link>
        </div>

        {/* Session Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-800 mb-2 text-lg flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Available Sessions Overview
                </h3>
                <p className="text-green-700">
                  {datesWithSessions.length} days with available sessions •{" "}
                  {sessions.filter((s) => s.status === "available").length}{" "}
                  total sessions
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-green-700">
                    Available
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    Multiple Tutors
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar and Filters Row */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="xl:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                  <span>Select Date</span>
                </CardTitle>
                <CardDescription>
                  Green dates have available sessions. Click to see details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-lg border shadow-sm w-full"
                  modifiers={{
                    hasSessions: datesWithSessions,
                  }}
                  modifiersStyles={{
                    hasSessions: {
                      backgroundColor: "#dcfce7",
                      borderRadius: "8px",
                      fontWeight: "600",
                    },
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />

                {/* Session summary for selected date */}
                {selectedDate && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-semibold">
                          {selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-blue-600 text-sm mt-1">
                          {getAvailableSessionsForDate(selectedDate).length}{" "}
                          available sessions
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                        {getTutorsForDate(selectedDate).length} tutors
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters Section */}
          <div className="xl:col-span-2">
            <Card className="shadow-md h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-purple-600" />
                  <span>Filter Sessions</span>
                </CardTitle>
                <CardDescription>
                  Narrow down sessions by subject and tutor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-3 block text-gray-700">
                    📚 Subject
                  </label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger className="h-12 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-3 block text-gray-700">
                    👨‍🏫 Tutor
                  </label>
                  <Select
                    value={selectedTutor}
                    onValueChange={setSelectedTutor}
                  >
                    <SelectTrigger className="h-12 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tutors</SelectItem>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor} value={tutor}>
                          {tutor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters Display */}
                {(selectedSubject !== "all" || selectedTutor !== "all") && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">
                      Active Filters:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubject !== "all" && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Subject: {selectedSubject}
                        </Badge>
                      )}
                      {selectedTutor !== "all" && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Tutor: {selectedTutor}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Sessions Full Width */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="text-2xl flex items-center space-x-3">
              <Clock className="h-6 w-6 text-green-600" />
              <span>Available Sessions</span>
            </CardTitle>
            <CardDescription className="text-lg">
              {selectedDate
                ? `Sessions for ${selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "Select a date from the calendar to view available sessions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {selectedDate &&
            getAvailableSessionsForDate(selectedDate).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(
                  groupSessionsByTutor(
                    getFilteredSessions(
                      getAvailableSessionsForDate(selectedDate)
                    )
                  )
                ).map(([tutorName, tutorSessions]) => (
                  <div
                    key={tutorName}
                    className="border-2 border-gray-100 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-xl flex items-center text-gray-800">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        {tutorName}
                      </h3>
                      <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 text-lg">
                        {tutorSessions?.length} session
                        {tutorSessions?.length > 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tutorSessions.map((session) => {
                        const sessionId = session.id || session._id;
                        const sessionDateTime = new Date(
                          `${session.date.split("T")[0]}T${session.time}:00`
                        );
                        const now = new Date();

                        let hoursUntilSession = null;
                        if (!isNaN(sessionDateTime.getTime())) {
                          hoursUntilSession = Math.round(
                            (sessionDateTime.getTime() - now.getTime()) /
                              (1000 * 60 * 60)
                          );
                        }

                        return (
                          <div
                            key={sessionId}
                            className={`bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
                              isTodaySession(session.date)
                                ? "border-l-red-500 bg-red-50"
                                : "border-l-green-500"
                            }`}
                          >
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-bold text-lg text-gray-800 mb-2">
                                  {session.subject}
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                                    <span className="font-medium">
                                      {formatTime(session.time)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>{formatDate(session.date)}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <span className="mr-2">⏱️</span>
                                    <span>{session.duration || "1 hour"}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {getStatusBadge(session.status)}
                                {hoursUntilSession !== null && (
                                  <Badge className="bg-green-100 text-green-800">
                                    {hoursUntilSession}h ahead
                                  </Badge>
                                )}
                                {isTodaySession(session.date) && (
                                  <Badge className="bg-red-100 text-red-800">
                                    Today
                                  </Badge>
                                )}
                              </div>

                              <div className="pt-2">
                                {!bookedDatesSet.has(
                                  new Date(session.date).toDateString()
                                ) ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md">
                                        Book Session
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl">
                                          Confirm Booking
                                        </DialogTitle>
                                        <DialogDescription>
                                          Please review and confirm your session
                                          booking
                                        </DialogDescription>
                                      </DialogHeader>

                                      <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg space-y-3">
                                          <h4 className="font-bold text-lg">
                                            {session.subject}
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <p className="flex items-center">
                                              <User className="h-4 w-4 mr-2 text-blue-500" />
                                              <span className="font-medium">
                                                Tutor:
                                              </span>
                                              <span className="ml-1">
                                                {session.tutorName ||
                                                  session.tutor}
                                              </span>
                                            </p>
                                            <p className="flex items-center">
                                              <CalendarIcon className="h-4 w-4 mr-2 text-green-500" />
                                              <span className="font-medium">
                                                Date:
                                              </span>
                                              <span className="ml-1">
                                                {formatDate(session.date)}
                                              </span>
                                            </p>
                                            <p className="flex items-center">
                                              <Clock className="h-4 w-4 mr-2 text-purple-500" />
                                              <span className="font-medium">
                                                Time:
                                              </span>
                                              <span className="ml-1">
                                                {formatTime(session.time)}
                                              </span>
                                            </p>
                                            <p className="flex items-center">
                                              <span className="mr-2">⏱️</span>
                                              <span className="font-medium">
                                                Duration:
                                              </span>
                                              <span className="ml-1">
                                                {session.duration || "1 hour"}
                                              </span>
                                            </p>
                                          </div>
                                        </div>

                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                          <h5 className="font-bold text-yellow-800 mb-2">
                                            📋 Booking Rules:
                                          </h5>
                                          <ul className="text-sm text-yellow-700 space-y-1">
                                            <li>
                                              • One session per day maximum
                                            </li>
                                            <li>
                                              • Must be booked at least 12 hours
                                              in advance
                                            </li>
                                            <li>
                                              • Payment required before session
                                            </li>
                                          </ul>
                                        </div>

                                        <div className="flex space-x-3">
                                          <Button
                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                            onClick={() =>
                                              handleBookSession(sessionId)
                                            }
                                          >
                                            Confirm Booking
                                          </Button>
                                          <Button
                                            variant="outline"
                                            className="flex-1"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600 font-medium">
                                      ✅ Already booked for this day
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-6">
                  <CalendarIcon className="h-20 w-20 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {selectedDate ? "No Sessions Available" : "Select a Date"}
                  </h3>
                  <p className="text-gray-500 text-lg">
                    {selectedDate
                      ? "No available sessions match your current filters."
                      : "Click on a calendar date to view available sessions."}
                  </p>
                </div>

                {selectedDate && (
                  <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto">
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      Possible reasons:
                    </p>
                    <ul className="text-sm text-gray-500 space-y-2">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                        No sessions available for selected filters
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                        Must be booked 12+ hours in advance
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                        Already booked for this day
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                        All slots are fully booked
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guidelines Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <span>📋</span>
              <span>Booking Rules & Guidelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-4 text-lg flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Session Availability
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Teachers available Monday-Saturday</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Available hours: 10:00 AM - 5:00 PM</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Each session is 1 hour long</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Sessions grouped by tutor for easy selection</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Booking Constraints
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Maximum 1 session per day per student</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Must book at least 12 hours in advance</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Payment required before session starts</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Only available sessions are shown</span>
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

export default BookSession;
