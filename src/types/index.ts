export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  avatar: string;
  phone?: string;
  grade?: string;
  subjects?: string[];
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
  date: string;
  time: string;
  duration: string;
  status: 'available' | 'booked' | 'completed';
  studentId?: string;
  meetingLink?: string;
  description?: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}
