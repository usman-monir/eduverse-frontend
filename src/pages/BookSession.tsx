import React, { useState, useEffect } from "react";
import { format, addHours, isAfter, isSameDay, parseISO } from "date-fns";
import { getSessions, createSessionSlotRequest, getTutorAvailability ,bookSession, getMySessions } from "@/services/api";

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

  // Helper function to check if user already has booking on the same day
  const hasBookingOnSameDay = (sessionDate: string) => {
    try {
      const sessionDay = new Date(sessionDate);
      if (!Array.isArray(userBookings)) return false;

      return userBookings.some((booking) => {
        const bookingDate = new Date(booking.date);
        return isSameDay(bookingDate, sessionDay);
      });
    } catch (error) {
      console.error("Error checking same day booking:", error);
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

  // Get available sessions for selected date
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

    const availableSessions = Object.entries(tutorSessions).flatMap(
      ([tutorName, sessions]) =>
        sessions.filter((session) => {
          const is12HoursAhead = isSessionAvailable(session.date, session.time);
          return is12HoursAhead;
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

  // Handle book session
  const handleBookSession = async (sessionId: string) => {
    try {
      console.log("Booking session with ID:", sessionId);
      if (!sessionId || sessionId === "undefined") {
        throw new Error("Invalid session ID");
      }
      await bookSession(sessionId, {});
      toast({
        title: "Class booked successfully!",
        description: "You will receive a confirmation email shortly.",
      });
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
              Click on calendar dates to see available sessions by tutor
            </p>
          </div>

          <Link to="/request-slot">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Request Custom Slot
            </Button>
          </Link>
        </div>

        {/* Session Summary */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 mb-1">
                  📅 Available Sessions Overview
                </h3>
                <p className="text-green-700 text-sm">
                  {datesWithSessions.length} days with available sessions •{" "}
                  {sessions.filter((s) => s.status === "available").length}{" "}
                  total sessions
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">
                    Tutor indicator
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge className="bg-green-500 text-white text-xs px-1 py-0.5">
                    3
                  </Badge>
                  <span className="text-sm text-green-700">Session count</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                📅 Calendar Booking
              </h3>
              <p className="text-blue-700 text-sm">
                Click on calendar dates to see sessions grouped by tutor
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-800 mb-2">
                ⏰ Request Custom Slot
              </h3>
              <p className="text-purple-700 text-sm">
                Request your preferred time with your chosen tutor
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Select Date</span>
                </CardTitle>
                <CardDescription>
                  Click on dates to see available sessions. Dots indicate
                  tutors, numbers show session count.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  dayContent={renderCalendarDay}
                  modifiers={{
                    hasSessions: datesWithSessions,
                  }}
                  modifiersStyles={{
                    hasSessions: {
                      backgroundColor: "#dcfce7",
                      borderRadius: "6px",
                    },
                  }}
                  disabled={(date) => {
                    // Disable past dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />

                {/* Session summary for selected date */}
                {selectedDate && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">
                        {getAvailableSessionsForDate(selectedDate).length}{" "}
                        available session(s)
                      </span>{" "}
                      on {selectedDate.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {getTutorsForDate(selectedDate).length} tutor(s):{" "}
                      {getTutorsForDate(selectedDate).join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subject
                  </label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
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
                  <label className="text-sm font-medium mb-2 block">
                    Tutor
                  </label>
                  <Select
                    value={selectedTutor}
                    onValueChange={setSelectedTutor}
                  >
                    <SelectTrigger>
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
              </CardContent>
            </Card>
          </div>

          {/* Available Sessions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Sessions</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Sessions for ${selectedDate.toLocaleDateString()}`
                    : "Click on a calendar date to view available sessions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate &&
                getAvailableSessionsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(
                      groupSessionsByTutor(
                        getFilteredSessions(
                          getAvailableSessionsForDate(selectedDate)
                        )
                      )
                    ).map(([tutorName, tutorSessions]) => (
                      <div
                        key={tutorName}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          {tutorName}
                          <Badge className="ml-2 bg-blue-100 text-blue-800">
                            {tutorSessions.length} session
                            {tutorSessions.length > 1 ? "s" : ""}
                          </Badge>
                        </h3>

                        <div className="space-y-3">
                          {tutorSessions.map((session) => {
                            const sessionId = session.id || session._id;

                            const sessionDateTime = new Date(
                              `${session.date.split("T")[0]}T${session.time}:00`
                            );
                            const now = new Date();

                            let hoursUntilSession: number | null = null;
                            let isTomorrow = false;

                            if (!isNaN(sessionDateTime.getTime())) {
                              hoursUntilSession = Math.round(
                                (sessionDateTime.getTime() - now.getTime()) /
                                  (1000 * 60 * 60)
                              );

                              // Check if session is tomorrow
                              const tomorrow = new Date();
                              tomorrow.setDate(now.getDate() + 1);
                              isTomorrow =
                                sessionDateTime.toDateString() ===
                                tomorrow.toDateString();
                            }

                            return (
                              <div
                                key={sessionId}
                                className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-lg">
                                      {session.subject}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <span className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatTime(session.time)}</span>
                                      </span>
                                      <span>📅 {formatDate(session.date)}</span>
                                      <span>
                                        ⏰ {session.duration || "1 hour"}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {getStatusBadge(session.status)}
                                      {hoursUntilSession !== null && (
                                        <Badge className="bg-green-100 text-green-800">
                                          {hoursUntilSession}h ahead
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {isTomorrow ? (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button>Book Session</Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            Confirm Booking
                                          </DialogTitle>
                                          <DialogDescription>
                                            Are you sure you want to book this
                                            session?
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                            <h4 className="font-semibold">
                                              {session.subject}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                              Tutor:{" "}
                                              {session.tutorName ||
                                                session.tutor}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Date: {formatDate(session.date)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Time: {formatTime(session.time)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Duration:{" "}
                                              {session.duration || "1 hour"}
                                            </p>
                                          </div>

                                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                            <h5 className="font-semibold text-yellow-800 mb-1">
                                              Booking Rules:
                                            </h5>
                                            <ul className="text-sm text-yellow-700 space-y-1">
                                              <li>
                                                • One session per day maximum
                                              </li>
                                              <li>
                                                • Must be booked at least 12
                                                hours in advance
                                              </li>
                                              <li>
                                                • Payment required before
                                                session
                                              </li>
                                            </ul>
                                          </div>

                                          <div className="flex space-x-2">
                                            <Button
                                              className="flex-1"
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
                                    <p className="text-xs text-gray-500 italic">
                                      Booking available only for sessions
                                      scheduled tomorrow.
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      {selectedDate
                        ? "No available sessions for the selected date and filters."
                        : "Click on a calendar date to view available sessions."}
                    </p>
                    {selectedDate && (
                      <div className="text-sm text-gray-400 mt-2 space-y-1">
                        <p>Possible reasons:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            No sessions available for selected date/filters
                          </li>
                          <li>
                            Sessions must be booked at least 12 hours in advance
                          </li>
                          <li>
                            You already have a booking on the selected day
                          </li>
                          <li>All slots are already booked</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Session Details Modal */}
        <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Available Sessions - {selectedDate?.toLocaleDateString()}
              </DialogTitle>
              <DialogDescription>
                Choose from available sessions grouped by tutor
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {Object.entries(
                groupSessionsByTutor(getFilteredSessions(selectedDateSessions))
              ).map(([tutorName, tutorSessions]) => (
                <div
                  key={tutorName}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {tutorName}
                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                      {tutorSessions.length} session
                      {tutorSessions.length > 1 ? "s" : ""}
                    </Badge>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tutorSessions.map((session) => {
                      const sessionId = session.id || session._id;
                      const sessionDateTime = new Date(
                        `${session.date}T${session.time}`
                      );
                      const now = new Date();
                      const tomorrow = new Date();
                      tomorrow.setDate(now.getDate() + 1);

                      const isTomorrow =
                        sessionDateTime.toDateString() ===
                        tomorrow.toDateString();

                      const hoursUntilSession = Math.round(
                        (sessionDateTime.getTime() - now.getTime()) /
                          (1000 * 60 * 60)
                      );

                      return (
                        <div
                          key={sessionId}
                          className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-2">
                            <h4 className="font-medium">{session.subject}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{session.time}</span>
                              </div>
                              <div>⏰ {session.duration || "1 hour"}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(session.status)}
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {hoursUntilSession}h ahead
                              </Badge>
                            </div>

                            {isTomorrow ? (
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  handleBookSession(sessionId);
                                  setShowSessionModal(false);
                                }}
                              >
                                Book Session
                              </Button>
                            ) : (
                              <p className="text-xs text-gray-500 italic">
                                Booking available only for tomorrow
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">
              Booking Rules & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">📅 Session Availability</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Teachers available Monday-Saturday</li>
                  <li>• Available hours: 10:00 AM - 5:00 PM</li>
                  <li>• Each session is 1 hour long</li>
                  <li>• Sessions grouped by tutor for easy selection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⏰ Booking Constraints</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Maximum 1 session per day per student</li>
                  <li>• Must book at least 12 hours in advance</li>
                  <li>• Payment required before session starts</li>
                  <li>• Only available sessions are shown</li>
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
