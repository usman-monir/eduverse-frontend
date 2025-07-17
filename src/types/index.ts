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
  type: 'admin_created' | 'tutor_created' | 'slot_request';
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
