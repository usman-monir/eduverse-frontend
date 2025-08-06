export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  avatar: string;
  phone?: string;
  grade?: string;
  subjects?: string[];
  accessTill?: string;
  // Student-specific fields
  preferredLanguage?: 'English' | 'Hindi' | 'Punjabi' | 'Nepali';
  desiredScore?: number;
  examDeadline?: string;
  courseType?: 'one-on-one' | 'smart-quad';
  courseDuration?: number;
  totalSessions?: number;
  courseExpiryDate?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx';
  uploadedBy: string;
  uploadedAt: string;
  subject: string;
  accessLevel: 'all' | 'student' | 'tutor';
}
type Student = {
  studentId: string;
  studentName?: string;
};


export interface ClassSession {
  id: string;
  subject: string;
  tutor: string;
  tutorId?: string;
  tutorName: string;

  date: string;
  time: string;
  duration: string;
  status: 'available' | 'booked' | 'completed' | 'pending' | 'approved' | 'cancelled';
  studentId?: string;
  meetingLink?: string;
  description?: string;
  type?: 'admin_created' | 'tutor_created' | 'slot_request';
  students: Student[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Smart Quad Types
export interface SmartQuadStudent {
  studentId: string | { _id: string; name: string; email: string };
  studentName: string;
  email: string;
  phone?: string;
}

export interface WeeklySchedule {
  day: string;
  time: string;
  duration: number;
}

export interface SmartQuad {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  tutor: string | { _id: string; name: string; email: string };
  tutorName: string;
  students: SmartQuadStudent[];
  maxStudents: number;
  currentStudents: number;
  status: 'forming' | 'active' | 'completed' | 'cancelled';
  courseType: 'one-on-one' | 'smart-quad';
  preferredLanguage: 'English' | 'Hindi' | 'Punjabi' | 'Nepali';
  desiredScore: number;
  examDeadline: string;
  courseDuration: number;
  totalSessions: number;
  completedSessions: number;
  courseExpiryDate: string;
  weeklySchedule: WeeklySchedule[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface NotificationStats {
  expiringStudents: number;
  activeSmartQuads: number;
  studentsInSmartQuads: number;
  notificationTypes: {
    courseExpiry: string;
    smartQuadAssignment: string;
    smartQuadRemoval: string;
    smartQuadCancellation: string;
    sessionCancellation: string;
  };
}

export interface NotificationResponse {
  totalStudents: number;
  notificationsSent: number;
  notificationsFailed: number;
  errors: any[];
}
