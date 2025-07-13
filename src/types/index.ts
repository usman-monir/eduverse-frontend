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

export interface ClassSession {
  id: string;
  subject: string;
  tutor: string;
  tutorId: string;
  date: string;
  time: string;
  duration: string;
  status: 'available' | 'booked' | 'completed' | 'pending' | 'approved' | 'cancelled';
  enrolledStudents: Array<{
    studentId: string;
    studentName: string;
    enrolledAt: string;
  }>;
  maxStudents: number;
  isFull: boolean;
  availableSpots: number;
  enrollmentCount: number;
  meetingLink?: string;
  description?: string;
  type: 'admin_created' | 'tutor_created' | 'slot_request';
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
