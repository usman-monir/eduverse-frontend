import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Calendar, User, Link as LinkIcon } from "lucide-react";
import axios from "axios";
import { getAvailableTutors, createSession } from "@/services/api";
import { ClassSession } from "@/types";

type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const weekdayLabels: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

interface TimeSlot {
  time: string;
  sessionData: Omit<ClassSession, "id" | "createdAt" | "updatedAt"> & {
    rawTime: string;
  };
  meetingLink?: string;
  isCreated: boolean;
  isCreating: boolean;
}

interface SessionFormProps {
  onSubmit: (
    sessionData: Omit<ClassSession, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  session?: ClassSession;
}

const SessionForm = ({ onSubmit, onCancel, session }: SessionFormProps) => {
  const [tutors, setTutors] = useState<any[]>([]);
  const [tutorId, setTutorId] = useState(
    session?.tutorId || session?.tutor || ""
  );
  const [tutorName, setTutorName] = useState(session?.tutorName || "");
  const [availability, setAvailability] = useState<Record<
    Weekday,
    { start: string; end: string }
  > | null>(null);
  const [existingSessions, setExistingSessions] = useState<
    { date: string; time: string }[]
  >([]);

  const [selectedDate, setSelectedDate] = useState(session?.date || "");
  const [selectedDay, setSelectedDay] = useState<Weekday | "">(
    session
      ? session.date
        ? (new Date(session.date)
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase() as Weekday)
        : ""
      : ""
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTutorData, setLoadingTutorData] = useState(false);
  const [generatingAllLinks, setGeneratingAllLinks] = useState(false);
  const [createdSessions, setCreatedSessions] = useState<any[]>([]); // Track created sessions

  // Prefill logic for edit mode
  useEffect(() => {
    if (session) {
      setTutorId(session.tutorId || session.tutor || "");
      setTutorName(session.tutorName || "");
      setSelectedDate(session.date || "");
      setSelectedDay(
        session.date
          ? (new Date(session.date)
              .toLocaleDateString("en-US", { weekday: "long" })
              .toLowerCase() as Weekday)
          : ""
      );
    }
  }, [session]);

  const refreshExistingSessions = async () => {
    if (!tutorId) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tutors/${tutorId}/availability`
      );
      const data = await res.json();

      if (data?.existingSessions) {
        const mapped = data.existingSessions.map((s: any) => ({
          date: new Date(s.date).toISOString().split("T")[0],
          time: s.time,
        }));
        setExistingSessions(mapped);
      }
    } catch (error) {
      console.error("Error refreshing existing sessions:", error);
    }
  };

  // Fetch tutors on component mount
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await getAvailableTutors();
        setTutors(response.data.data || []);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      }
    };
    fetchTutors();
  }, []);

  // Generate time slots when date is selected
  useEffect(() => {
    if (selectedDate && availability && selectedDay) {
      generateTimeSlots();
    }
  }, [selectedDate, availability, selectedDay, existingSessions]);

  const handleTutorChange = async (id: string) => {
    const tutor = tutors.find((t) => t._id === id);
    if (!tutor) return;

    setLoadingTutorData(true);
    setTutorId(id);
    setTutorName(tutor.name);
    setSelectedDay("");
    setSelectedDate("");
    setTimeSlots([]);
    setAvailability(null);
    setCreatedSessions([]); // Reset created sessions

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tutors/${id}/availability`
      );
      const data = await res.json();

      if (data?.availability) {
        setAvailability(data.availability);
      }

      if (data?.existingSessions) {
        const mappedSessions = data.existingSessions.map((session: any) => ({
          date: new Date(session.date).toISOString().split("T")[0],
          time: session.time,
        }));
        setExistingSessions(mappedSessions);
      }
    } catch (err) {
      console.error("Error fetching tutor data:", err);
    } finally {
      setLoadingTutorData(false);
    }
  };

  // New function to handle date change and determine the weekday
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setTimeSlots([]);
    setCreatedSessions([]);
    
    if (date) {
      const dateObj = new Date(date);
      const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as Weekday;
      setSelectedDay(weekday);
    } else {
      setSelectedDay("");
    }
  };

  const generateTimeSlots = () => {
    if (!selectedDay || !selectedDate || !availability) return;

    const dayAvailability = availability[selectedDay];
    if (!dayAvailability) {
      setTimeSlots([]);
      return;
    }

    const startHour = parseInt(dayAvailability.start.split(":")[0]);
    const endHour = parseInt(dayAvailability.end.split(":")[0]);
    const slots: TimeSlot[] = [];

    const normalizedSelectedDate = new Date(selectedDate)
      .toISOString()
      .split("T")[0];

    for (let hour = startHour; hour < endHour; hour++) {
      const time24 = `${hour.toString().padStart(2, "0")}:00`;

      const sessionExists = existingSessions.some((s) => {
        const sessionDate = new Date(s.date).toISOString().split("T")[0];
        return sessionDate === normalizedSelectedDate && s.time === time24;
      });

      if (sessionExists) {
        console.log(
          `⛔ Skipping slot ${time24} on ${normalizedSelectedDate} — already exists`
        );
        continue;
      }

      const dateForFormat = new Date(`${normalizedSelectedDate}T${time24}`);
      const time12 = formatTime12Hour(dateForFormat);

      const sessionData: Omit<ClassSession, "id" | "createdAt" | "updatedAt"> =
        {
          subject: "1-on-1 Session",
          tutor: tutorId,
          tutorName,
          date: normalizedSelectedDate,
          time: time24,
          duration: "60 minutes",
          status: "available",
          studentId: "",
          meetingLink: "",
          description: "",
          type: "admin_created",
          createdBy: "admin",
          students: [],
        };

      slots.push({
        time: time12,
        sessionData: {
          ...sessionData,
          rawTime: time24,
        },
        isCreated: false,
        isCreating: false,
      });
    }

    console.log(
      `✅ Generated ${slots.length} time slots for ${normalizedSelectedDate}`
    );
    setTimeSlots(slots);
  };

  const handleCreateSession = async (index: number) => {
    const slot = timeSlots[index];
    if (slot.isCreated || slot.isCreating) return;

    const updatedSlots = [...timeSlots];
    updatedSlots[index].isCreating = true;
    setTimeSlots(updatedSlots);

    try {
      const sessionStart = new Date(
        `${selectedDate}T${slot.sessionData.rawTime}`
      );
      const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);

      const sessionData = {
        ...slot.sessionData,
        tutorId,
      };

      await createSession(sessionData);

      // ✅ Add to created sessions array instead of calling onSubmit immediately
      setCreatedSessions((prev) => [...prev, sessionData]);

      // ✅ Update the specific slot to show it's created
      updatedSlots[index] = {
        ...slot,
        isCreated: true,
        isCreating: false,
        sessionData,
      };
      setTimeSlots(updatedSlots);

      // ✅ Refresh existing sessions to get updated data
      await refreshExistingSessions();
    } catch (error) {
      console.error("Error creating session:", error);
      updatedSlots[index].isCreating = false;
      setTimeSlots(updatedSlots);
    }
  };

  const handleCreateAllSessions = async () => {
    setGeneratingAllLinks(true);
    const newlyCreatedSessions: any[] = [];
    const availableSlots = timeSlots.filter(slot => !slot.isCreated);
    
    try {
      // Create all sessions in parallel for faster execution
      const sessionPromises = availableSlots.map(async (slot, originalIndex) => {
        const index = timeSlots.findIndex(s => s === slot);
        
        const updatedSlots = [...timeSlots];
        updatedSlots[index].isCreating = true;
        setTimeSlots(updatedSlots);

        try {
          const rawTime = slot.sessionData.rawTime;
          const sessionStart = new Date(`${selectedDate}T${rawTime}`);
          const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);

          const sessionData = {
            ...slot.sessionData,
            tutorId,
          };

          await createSession(sessionData);
          
          return { sessionData, index };
        } catch (error) {
          console.error(`Error creating session for ${slot.time}:`, error);
          return { error, index };
        }
      });

      // Wait for all sessions to be created
      const results = await Promise.all(sessionPromises);
      
      // Process results
      const updatedSlots = [...timeSlots];
      results.forEach((result) => {
        if ('sessionData' in result) {
          newlyCreatedSessions.push(result.sessionData);
          updatedSlots[result.index] = {
            ...timeSlots[result.index],
            isCreated: true,
            isCreating: false,
            sessionData: result.sessionData,
          };
        } else {
          updatedSlots[result.index].isCreating = false;
        }
      });

      setTimeSlots(updatedSlots);

      // ✅ Add all newly created sessions to the array
      setCreatedSessions((prev) => [...prev, ...newlyCreatedSessions]);

      // ✅ Refresh existing sessions after all are created
      await refreshExistingSessions();
    } finally {
      setGeneratingAllLinks(false);
    }
  };

  // ✅ Updated function to handle final submission without API call
  const handleFinalSubmit = () => {
    if (createdSessions.length > 0) {
      // Just close the form/modal without making another API call
      // The sessions are already created, so we just need to close
      onCancel(); // or you can call a separate onClose prop if available
    }
  };

  const formatTime12Hour = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Scrollable form content wrapper */}
      <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
        {/* Tutor Selection */}
        <div>
          <Label>Select Tutor</Label>
          <Select onValueChange={handleTutorChange} disabled={loadingTutorData}>
            <SelectTrigger>
              <SelectValue placeholder="Select tutor" />
            </SelectTrigger>
            <SelectContent>
              {tutors.map((tutor) => (
                <SelectItem key={tutor._id} value={tutor._id}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {tutor.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loadingTutorData && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading tutor availability...</span>
          </div>
        )}

        {/* Availability Display */}
        {availability && !loadingTutorData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(availability).map(([day, time]) => {
                  if (!time) return null;
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="font-medium">
                        {weekdayLabels[day as Weekday]}
                      </span>
                      <Badge variant="outline" className="text-green-600">
                        {formatTime12Hour(new Date(`2000-01-01T${time.start}`))}{" "}
                        - {formatTime12Hour(new Date(`2000-01-01T${time.end}`))}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Selection with Calendar */}
        {availability && (
          <div>
            <Label>Select Date to Generate Sessions</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
          </div>
        )}

        {selectedDay && selectedDate && (
          <p className="text-sm text-muted-foreground">
            Sessions will be created for{" "}
            <strong>{weekdayLabels[selectedDay]}</strong>, {selectedDate}
            {availability && !availability[selectedDay] && (
              <span className="text-red-500 ml-2">
                (Tutor is not available on {weekdayLabels[selectedDay]}s)
              </span>
            )}
          </p>
        )}

        {/* Show created sessions summary */}
        {createdSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600">
                ✅ Created Sessions ({createdSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {createdSessions.length} session(s) have been successfully
                created and saved.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Time Slots */}
        {timeSlots.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Available Time Slots - {weekdayLabels[selectedDay as Weekday]}
              </CardTitle>
              <Button
                onClick={handleCreateAllSessions}
                disabled={
                  generatingAllLinks ||
                  timeSlots.every((slot) => slot.isCreated)
                }
                className="ml-auto"
              >
                {generatingAllLinks ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating All...
                  </>
                ) : (
                  "Create All Sessions"
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      slot.isCreated
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{slot.time}</span>
                      </div>
                      {slot.isCreated && (
                        <Badge variant="default" className="bg-green-600">
                          Created
                        </Badge>
                      )}
                    </div>

                    {slot.meetingLink && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <LinkIcon className="w-3 h-3" />
                          Meeting Link:
                        </div>
                        <a
                          href={slot.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          {slot.meetingLink}
                        </a>
                      </div>
                    )}

                    <Button
                      onClick={() => handleCreateSession(index)}
                      disabled={slot.isCreated || slot.isCreating}
                      className="w-full"
                      size="sm"
                    >
                      {slot.isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : slot.isCreated ? (
                        "Session Created"
                      ) : (
                        "Create Session"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Form Actions (not scrollable) */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        {/* ✅ Only show Done button if sessions were created */}
        {createdSessions.length > 0 && (
          <Button type="button" onClick={handleFinalSubmit}>
            Done ({createdSessions.length} sessions created)
          </Button>
        )}
      </div>
    </div>
  );
};

export default SessionForm;