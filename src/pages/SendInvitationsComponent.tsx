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
} from "lucide-react";
import { getAvailableTutors, getTutorAvailability, getStudents, sendBulkInvitations } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from '@/components/Layout/DashboardLayout';
const SendInvitationsComponent = () => {
  const [tutors, setTutors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitationsSent, setInvitationsSent] = useState(false);
  const {user} = useAuth();

  // Fetch students (replace with real API if needed)
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
        await extractAvailableSlots(tutorList, user.id);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      }
    };

    fetchTutors();
  }, []);

  const extractAvailableSlots = async (
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

      // ✅ Add existing available sessions from DB
      existingSessions
        .filter((s: any) => s.status === "available")
        .forEach((session: any) => {
          slots.push({
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

      // ✅ Exclude all other sessions (booked/approved/pending)
    // ❗ Block *all* existing sessions for tomorrow (even "available")
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

const occupiedSet = new Set(
  existingSessions
    .filter((s: any) => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === tomorrow.getTime();
    })
    .map((s: any) => {
      const time = s.time;
      const date = new Date(s.date).toISOString().slice(0, 10);
      return `${date}-${time}`;
    })
);

      // ⏳ Build slots from availability (excluding occupied ones)
      // for (let i = 1; i <= 1; i++) {
      //   const date = new Date();
      //   date.setDate(date.getDate() + i);
      //   const dayName = date
      //     .toLocaleDateString("en-US", { weekday: "long" })
      //     .toLowerCase();
      //   const dayAvailability = availability[dayName];
      //   if (!dayAvailability) continue;

      //   const [startHour, startMin] = dayAvailability.start
      //     .split(":")
      //     .map(Number);
      //   const [endHour, endMin] = dayAvailability.end.split(":").map(Number);

      //   let slotTime = new Date(date);
      //   slotTime.setHours(startHour, startMin, 0, 0);

      //   const endTime = new Date(date);
      //   endTime.setHours(endHour, endMin, 0, 0);

      //   while (slotTime < endTime) {
      //     const slotStr = slotTime.toTimeString().slice(0, 5);
      //     const dateStr = slotTime.toISOString().slice(0, 10);
      //     const key = `${dateStr}-${slotStr}`;

      //     if (!occupiedSet.has(key)) {
      //       slots.push({
      //         tutorId: tutor._id,
      //         tutorName: tutor.name,
      //         tutorEmail: tutor.email,
      //         date: dateStr,
      //         time: slotStr,
      //         meetingLink: "",
      //       });
      //     }

      //     slotTime.setHours(slotTime.getHours() + 1);
      //   }
      // }
    });

    // 4. Sort by date and time
    slots.sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time}`);
      const bTime = new Date(`${b.date}T${b.time}`);
      return aTime.getTime() - bTime.getTime();
    });

    console.log("✅ Total Available Slots:", slots.length);
    setAvailableSlots(slots);
  };

  // Send Invitations
  const sendInvitations = async () => {
    setLoading(true);
    try {
      await sendBulkInvitations({
        students: students.map((s) => ({ name: s.name, email: s.email })),
        slots: availableSlots,
      });
      setInvitationsSent(true);
    } catch (e) {
      console.error("Sending failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invitations to Students
          </CardTitle>
          <CardDescription>
            Invite students to book available slots
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Available Slots</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    availableSlots.filter((slot) => {
                      const slotDate = new Date(slot.date);
                      const today = new Date();
                      const tomorrow = new Date();
                      tomorrow.setDate(today.getDate() + 1);
                      slotDate.setHours(0, 0, 0, 0);
                      tomorrow.setHours(0, 0, 0, 0);
                      return (
                        (!slot.status || slot.status === "available") &&
                        slotDate.getTime() === tomorrow.getTime()
                      );
                    }).length
                  }
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

      {/* Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Available Slots (Tomorrow Only)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableSlots
              .filter((slot) => {
                const slotDate = new Date(slot.date);
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);

                // Normalize time to compare only date parts
                slotDate.setHours(0, 0, 0, 0);
                tomorrow.setHours(0, 0, 0, 0);

                return (
                  (!slot.status || slot.status === "available") &&
                  slotDate.getTime() === tomorrow.getTime()
                );
              })
              .map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{slot.tutorName}</p>
                    <div className="text-sm text-gray-600 flex gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(slot.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(slot.time)}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Available
                  </Badge>
                </div>
              ))}

            {availableSlots.filter((slot) => {
              const slotDate = new Date(slot.date);
              const today = new Date();
              const tomorrow = new Date();
              tomorrow.setDate(today.getDate() + 1);
              slotDate.setHours(0, 0, 0, 0);
              tomorrow.setHours(0, 0, 0, 0);

              return (
                (!slot.status || slot.status === "available") &&
                slotDate.getTime() === tomorrow.getTime()
              );
            }).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No available slots found for tomorrow</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Will receive the invitation</CardDescription>
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {invitationsSent ? (
              <div className="flex justify-center items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Invitations sent successfully!
              </div>
            ) : (
              <>
                <Button
                  onClick={sendInvitations}
                  disabled={loading || availableSlots.length === 0}
                  className="px-8 py-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitations
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600">
                  This will send an email with all booking slots to{" "}
                  {students.length} students.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default SendInvitationsComponent;
