import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getTutorAvailability, updateTutorAvailability } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import { getAvailableTutors } from "@/services/api";
const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const value = `${hour.toString().padStart(2, "0")}:${minute}`;

  // Convert to 12-hour format
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  const label = `${hour12}:${minute} ${suffix}`;

  return { label, value };
});

type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

type WeeklyAvailability = {
  [day in Weekday]?: {
    start: string;
    end: string;
  };
};

type Tutor = {
  _id: string;
  name: string;
  email: string;
};

const AdminManageTutorAvailability = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [availability, setAvailability] = useState<WeeklyAvailability>({});
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Weekday | null>(null);
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const formatTime = (t?: string) => {
    if (!t || !t.includes(":")) return "—";

    const [hourStr, minuteStr] = t.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`;
  };

  // Fetch all tutors
  const fetchTutors = async () => {
    try {
      const res = await getAvailableTutors();
      const data = await res.data.data	;
      const tutorsData = [];
      const updatedData = data.filter((item: any) => {
        if (item.role === "tutor") {
          tutorsData.push(item);
        }
      });
      console.log("ALL TUTORS: ", tutorsData);
      setTutors(tutorsData);
    } catch (err) {
      console.error("Error fetching tutors:", err);
    }
  };

  // Fetch selected tutor's availability
  const fetchAvailability = async (tutorId: string) => {
    setLoading(true);
    try {
      const { data } = await getTutorAvailability(tutorId);
      setAvailability(data.availability);
    } catch (err) {
      console.error("Error fetching availability:", err);
    } finally {
      setLoading(false);
    }
  };
  const getValidEndTimes = (start: string) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const startIndex = timeSlots.findIndex((slot) => slot.value === start);

    // Require end time to be at least 2 slots (1 hour) after start
    return timeSlots.slice(startIndex + 2);
  };

  // Save availability for selected day
  const handleSaveDay = async () => {
    if (!selectedTutor || !selectedDay) return;

    const updated = {
      ...availability,
      [selectedDay]: { start: timeRange.start, end: timeRange.end },
    };

    try {
      const res = await updateTutorAvailability(selectedTutor._id, updated);
      if (res.status === 200) {
        setAvailability(updated);
        setSelectedDay(null);
        setTimeRange({ start: "", end: "" });
      }
    } catch (err) {
      console.error("Error saving availability:", err);
    }
  };

  // Delete availability for a day
  const handleDeleteDay = async (day: Weekday) => {
    if (!selectedTutor) return;

    try {
      const res = await fetch(
         `${import.meta.env.VITE_API_BASE_URL}/tutors/${selectedTutor._id}/availability/${day}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        const updated = { ...availability };
        delete updated[day];
        setAvailability(updated);
      }
    } catch (err) {
      console.error("Error deleting day:", err);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Tutor Weekly Availability</CardTitle>
          <CardDescription>
            View and update each tutor’s weekly availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tutors.map((tutor) => (
            <div
              key={tutor._id}
              className="flex items-center justify-between border p-4 rounded-lg"
            >
              <div>
                <p className="font-semibold">{tutor.name}</p>
                <p className="text-sm text-gray-500">{tutor.email}</p>
              </div>
              <Button
                variant="default"
                onClick={() => {
                  setSelectedTutor(tutor);
                  fetchAvailability(tutor._id);
                }}
              >
                <Edit className="h-4 w-4 mr-2" /> Manage Availability
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal to Manage Weekly Availability */}
      {selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              Availability for {selectedTutor.name}
            </h2>
            {loading ? (
              <p>Loading availability...</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(availability).map(([day, time]) => (
                  <div
                    key={day}
                    className="flex justify-between items-center border p-3 rounded-lg"
                  >
                    <span className="capitalize">
                      {day}: {formatTime(time?.start)} - {formatTime(time?.end)}
                    </span>

                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDay(day as Weekday);
                          setTimeRange(
                            time &&
                              typeof time.start === "string" &&
                              typeof time.end === "string"
                              ? time
                              : { start: "", end: "" }
                          );
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Buttons on the same row */}
                <div className="flex justify-between space-x-2">
                  <Button
                    onClick={() => {
                      setSelectedDay("monday");
                      setTimeRange({ start: "", end: "" });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Day
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setSelectedTutor(null)}
                  >
                    <X className="h-4 w-4 mr-1" /> Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Day Dialog */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 capitalize">
              {availability[selectedDay] ? "Edit" : "Add"} availability for{" "}
              {selectedDay}
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Day</Label>
                <Select
                  value={selectedDay}
                  onValueChange={(val) => setSelectedDay(val as Weekday)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ]
                      .filter((day) => !availability[day as Weekday])
                      .map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Time</Label>
                <Select
                  value={timeRange.start}
                  onValueChange={(val) =>
                    setTimeRange({ ...timeRange, start: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Start Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>End Time</Label>
                <Select
                  value={timeRange.end}
                  onValueChange={(val) =>
                    setTimeRange({ ...timeRange, end: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select End Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {(timeRange.start
                      ? getValidEndTimes(timeRange.start)
                      : timeSlots
                    ) // If no start selected, show nothing or all
                      .map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedDay(null)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSaveDay}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageTutorAvailability;
