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
      const data = await res.data.data;
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
        `${import.meta.env.VITE_API_BASE_URL}/tutors/${
          selectedTutor._id
        }/availability/${day}`,
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
    <div className="max-w-full mx-auto p-6 space-y-6">
      {/* Tutor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Tutor Availability</CardTitle>
          <CardDescription>
            Select a tutor to set their weekly schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutors.map((tutor) => (
              <div
                key={tutor._id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedTutor?._id === tutor._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  setSelectedTutor(tutor);
                  fetchAvailability(tutor._id);
                }}
              >
                <h3 className="font-semibold text-lg">{tutor.name}</h3>
                <p className="text-gray-600 text-sm">{tutor.email}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid */}
      {selectedTutor && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule - {selectedTutor.name}</CardTitle>
            <CardDescription>
              Click on a day to set availability times
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading schedule...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                ].map((day) => {
                  const dayAvailability = availability[day as Weekday];
                  return (
                    <div
                      key={day}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        dayAvailability
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        setSelectedDay(day as Weekday);
                        setTimeRange(dayAvailability || { start: "", end: "" });
                      }}
                    >
                      <div className="text-center">
                        <h3 className="font-semibold capitalize text-lg mb-2">
                          {day}
                        </h3>
                        {dayAvailability ? (
                          <div className="space-y-1">
                            <div className="text-sm text-green-700 font-medium">
                              Available
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatTime(dayAvailability.start)} -{" "}
                              {formatTime(dayAvailability.end)}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDay(day as Weekday);
                              }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <Plus className="h-8 w-8 mx-auto mb-1" />
                            <div className="text-sm">Click to add</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Time Selection Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 capitalize">
                Set availability for {selectedDay}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Start Time
                  </Label>
                  <Select
                    value={timeRange.start}
                    onValueChange={(val) =>
                      setTimeRange({ ...timeRange, start: val, end: "" })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select start time" />
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
                  <Label className="text-sm font-medium mb-2 block">
                    End Time
                  </Label>
                  <Select
                    value={timeRange.end}
                    onValueChange={(val) =>
                      setTimeRange({ ...timeRange, end: val })
                    }
                    disabled={!timeRange.start}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {(timeRange.start
                        ? getValidEndTimes(timeRange.start)
                        : []
                      ).map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {timeRange.start && timeRange.end && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Preview:</strong> Available{" "}
                      {formatTime(timeRange.start)} -{" "}
                      {formatTime(timeRange.end)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDay(null);
                    setTimeRange({ start: "", end: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDay}
                  disabled={!timeRange.start || !timeRange.end}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Schedule
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
