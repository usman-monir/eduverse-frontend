import React, { useState, useEffect } from "react";
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
  Mail,
  Calendar,
  Clock,
  User,
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  Zap,
} from "lucide-react";
import {
  getAvailableTutors,
  getTutorAvailability,
  getStudents,
  sendBulkInvitations,
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/Layout/DashboardLayout";

const SendTodaysInvitationsComponent = () => {
  const [tutors, setTutors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitationsSent, setInvitationsSent] = useState(false);
  const { user } = useAuth();

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudents();
        const studentList = response.data.data || [];
        console.log("Fetched Students:", studentList);
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour);
    const suffix = hourInt >= 12 ? "PM" : "AM";
    const hour12 = hourInt % 12 === 0 ? 12 : hourInt % 12;
    return `${hour12}:${minute} ${suffix}`;
  };

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await getAvailableTutors();
        const tutorList = response.data?.data || [];
        setTutors(tutorList);
        await extractTodaysAvailableSlots(tutorList, user.id);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      }
    };

    fetchTutors();
  }, []);

  const extractTodaysAvailableSlots = async (
    tutorList: any[],
    currentUserId: string
  ) => {
    const slots: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // 1. Filter tutors to exclude self & admins
    const filteredTutors = tutorList.filter(
      (tutor) => tutor._id !== currentUserId && tutor.role !== "admin"
    );

    console.log(
      "👨‍🏫 Filtered Tutors (excluding admin & self):",
      filteredTutors.length
    );

    // 2. Fetch availability for each tutor
    const availabilityResponses = await Promise.all(
      filteredTutors.map(async (tutor) => {
        try {
          const response = await getTutorAvailability(tutor._id);
          return { tutor, ...response.data }; // Contains availability + existingSessions
        } catch (err) {
          console.error(
            `❌ Error fetching availability for tutor ${tutor._id}`,
            err
          );
          return null;
        }
      })
    );

    availabilityResponses.forEach((entry) => {
      if (!entry) return;

      const { tutor, availability, existingSessions = [] } = entry;

      if (!availability) {
        console.warn(`⚠️ Tutor ${tutor.name} has no availability defined.`);
        return;
      }

      // ✅ Add existing available sessions from DB for TODAY only
      existingSessions
        .filter((s: any) => {
          const sessionDate = new Date(s.date);
          sessionDate.setHours(0, 0, 0, 0);
          return (
            s.status === "available" &&
            sessionDate.getTime() === today.getTime() &&
            s.isTodayInviteTriggered !== true // ✅ Exclude already invited
          );
        })
        .forEach((session: any) => {
          slots.push({
            _id: session._id,
            tutorId: tutor._id,
            tutorName: tutor.name,
            tutorEmail: tutor.email,
            date: session.date,
            time: session.time,
            meetingLink: session.meetingLink,
            status: "available",
            type: session.type || "admin_created",
          });
        });

      // ✅ Exclude all other sessions (booked/approved/pending) for TODAY
      const occupiedSet = new Set(
        existingSessions
          .filter((s: any) => {
            const sessionDate = new Date(s.date);
            sessionDate.setHours(0, 0, 0, 0);
            return (
              s.status !== "available" &&
              sessionDate.getTime() === today.getTime()
            );
          })
          .map((s: any) => `${s.date}-${s.time}`)
      );

      // ⏳ Build slots from availability for TODAY only (excluding occupied ones)
      const todayDate = new Date();
      const dayName = todayDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const dayAvailability = availability[dayName];

      if (dayAvailability) {
        const [startHour, startMin] = dayAvailability.start
          .split(":")
          .map(Number);
        const [endHour, endMin] = dayAvailability.end.split(":").map(Number);

        let slotTime = new Date(todayDate);
        slotTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(todayDate);
        endTime.setHours(endHour, endMin, 0, 0);

        // Only show future slots for today (not past slots)
        const currentTime = new Date();

        while (slotTime < endTime) {
          const slotStr = slotTime.toTimeString().slice(0, 5);
          const dateStr = slotTime.toISOString().slice(0, 10);
          const key = `${dateStr}-${slotStr}`;

          // Only include slots that are in the future for today
          if (!occupiedSet.has(key) && slotTime > currentTime) {
            slots.push({
              tutorId: tutor._id,
              tutorName: tutor.name,
              tutorEmail: tutor.email,
              date: dateStr,
              time: slotStr,
              meetingLink: "",
            });
          }

          slotTime.setHours(slotTime.getHours() + 1);
        }
      }
    });

    // 4. Sort by time
    slots.sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time}`);
      const bTime = new Date(`${b.date}T${b.time}`);
      return aTime.getTime() - bTime.getTime();
    });

    console.log("✅ Total Available Slots for Today:", slots.length);
    console.log("🔎 Available slots before filter:", slots);
    setAvailableSlots(slots);
  };

  // Send Invitations for Today's sessions
  const sendTodaysInvitations = async () => {
    setLoading(true);
    try {
      const existingSlots = availableSlots.filter((slot) => slot._id);
      console.log(
        "📦 Sending slots to bulkInvite:",
        existingSlots.map((s) => s._id)
      );

      // Send with a special flag to indicate these are today's sessions
      await sendBulkInvitations({
        students: students.map((s) => ({ name: s.name, email: s.email })),
        slots: availableSlots.filter((slot) => slot._id),
        isToday: true, // Special flag to differentiate today's invitations
        urgentBooking: true, // Another flag to indicate urgent/immediate booking allowed
      });
      setInvitationsSent(true);
    } catch (e) {
      console.error("Sending today's invitations failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysAvailableCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return availableSlots.filter((slot) => {
      const slotDate = new Date(`${slot.date}T${slot.time}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      slotDate.setHours(0, 0, 0, 0);

      return (
        (!slot.status || slot.status === "available") &&
        slotDate.getTime() === today.getTime()
      );
    }).length;
  };

  const getTodaysFilteredSlots = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return availableSlots.filter((slot) => {
      const slotDateTime = new Date(`${slot.date}T${slot.time}`);
      slotDateTime.setHours(0, 0, 0, 0);

      return (
        (!slot.status || slot.status === "available") &&
        slotDateTime.getTime() === today.getTime()
      );
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Zap className="h-5 w-5" />
              Send Today's Session Invitations (Urgent)
            </CardTitle>
            <CardDescription className="text-orange-700">
              Send urgent invitations for TODAY's available sessions - Students
              will be able to book immediately
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    Today's Available Slots
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {getTodaysAvailableCount()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Tutors</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tutors.filter((tutor) => tutor.role !== "admin").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Slots */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              Available Slots for Today
            </CardTitle>
            <CardDescription>
              These sessions can be booked immediately after sending invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getTodaysFilteredSlots().map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50"
                >
                  <div>
                    <p className="font-medium text-orange-900">
                      {slot.tutorName}
                    </p>
                    <div className="text-sm text-orange-700 flex gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(slot.date)} (Today)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(slot.time)}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 border-orange-300"
                  >
                    Available Today
                  </Badge>
                </div>
              ))}

              {getTodaysAvailableCount() === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No available slots found for today</p>
                  <p className="text-sm mt-2">
                    This might be because all slots are booked or no tutors have
                    availability set for today
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              Will receive urgent booking invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {invitationsSent ? (
                <div className="flex justify-center items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Today's session invitations sent successfully!
                </div>
              ) : (
                <>
                  <Button
                    onClick={sendTodaysInvitations}
                    disabled={loading || getTodaysAvailableCount() === 0}
                    className="px-8 py-2 bg-orange-600 hover:bg-orange-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Urgent Invitations...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Send Today's Session Invitations
                      </>
                    )}
                  </Button>
                  <div className="space-y-2">
                    <p className="text-sm text-orange-700 font-medium">
                      This will send urgent booking invitations for TODAY's
                      sessions to {students.length} students.
                    </p>
                    <p className="text-xs text-orange-600">
                      ⚠️ Students will be able to see and book today's sessions
                      immediately after this action.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SendTodaysInvitationsComponent;
