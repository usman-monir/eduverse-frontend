
import { ClassSession, Message } from '@/types';

// Users data
export const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@student.com',
    phone: '+1234567890',
    role: 'student',
    enrolledSessions: 3,
    completedSessions: 12,
    joinedDate: '2024-01-15',
    status: 'active',
    avatar: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@student.com',
    phone: '+1234567891',
    role: 'student',
    enrolledSessions: 2,
    completedSessions: 8,
    joinedDate: '2024-02-10',
    status: 'active',
    avatar: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@student.com',
    phone: '+1234567892',
    role: 'student',
    enrolledSessions: 1,
    completedSessions: 3,
    joinedDate: '2024-03-05',
    status: 'inactive',
    avatar: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@tutor.com',
    phone: '+1234567893',
    role: 'tutor',
    subjects: ['Mathematics', 'Physics'],
    experience: '10 years',
    joinedDate: '2023-01-15',
    status: 'active',
    avatar: '/placeholder.svg'
  },
  {
    id: '5',
    name: 'Prof. Michael Johnson',
    email: 'michael.johnson@tutor.com',
    phone: '+1234567894',
    role: 'tutor',
    subjects: ['Physics', 'Chemistry'],
    experience: '15 years',
    joinedDate: '2023-02-10',
    status: 'active',
    avatar: '/placeholder.svg'
  }
];

export const mockClassSessions: ClassSession[] = [
  {
    id: '1',
    subject: 'Advanced Mathematics',
    tutor: 'Dr. Sarah Wilson',
    date: '2024-06-28',
    time: '10:00',
    duration: '1 hour',
    status: 'available',
    meetingLink: 'https://meet.google.com/abc-def-ghi'
  },
  {
    id: '2',
    subject: 'Physics Fundamentals',
    tutor: 'Prof. Michael Johnson',
    date: '2024-06-28',
    time: '14:00',
    duration: '1.5 hours',
    status: 'booked',
    studentId: '1',
    meetingLink: 'https://meet.google.com/xyz-abc-def'
  },
  {
    id: '3',
    subject: 'Computer Science Basics',
    tutor: 'Dr. Emily Chen',
    date: '2024-06-29',
    time: '09:00',
    duration: '2 hours',
    status: 'available',
    meetingLink: 'https://meet.google.com/def-ghi-jkl'
  },
  {
    id: '4',
    subject: 'Advanced Mathematics',
    tutor: 'Dr. Sarah Wilson',
    date: '2024-06-29',
    time: '15:00',
    duration: '1 hour',
    status: 'available',
    meetingLink: 'https://meet.google.com/ghi-jkl-mno'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'Dr. Sarah Wilson',
    content: 'Your assignment submission has been reviewed. Great work on the calculus problems!',
    timestamp: '2024-06-25T10:30:00Z',
    read: false
  },
  {
    id: '2',
    sender: 'System',
    content: 'Reminder: Your Physics class is scheduled for tomorrow at 2:00 PM',
    timestamp: '2024-06-25T09:00:00Z',
    read: true
  },
  {
    id: '3',
    sender: 'Prof. Michael Johnson',
    content: 'New study materials have been uploaded for the thermodynamics chapter.',
    timestamp: '2024-06-24T16:45:00Z',
    read: true
  }
];

export const mockStudyMaterials = [
  {
    id: '1',
    title: 'Mathematics - Calculus Notes',
    description: 'Comprehensive calculus study material covering derivatives and integrals',
    fileName: 'calculus-notes.pdf',
    subject: 'Mathematics',
    uploadedBy: 'Dr. Sarah Wilson',
    uploadedAt: '2024-01-15',
    fileType: 'pdf' as const
  },
  {
    id: '2',
    title: 'Physics - Quantum Mechanics',
    description: 'Introduction to quantum mechanics and wave functions',
    fileName: 'quantum-mechanics.pdf',
    subject: 'Physics',
    uploadedBy: 'Prof. Michael Johnson',
    uploadedAt: '2024-01-10',
    fileType: 'pdf' as const
  },
  {
    id: '3',
    title: 'Chemistry - Organic Compounds',
    description: 'Study guide for organic chemistry reactions',
    fileName: 'organic-chemistry.docx',
    subject: 'Chemistry',
    uploadedBy: 'Dr. Emily Chen',
    uploadedAt: '2024-01-08',
    fileType: 'docx' as const
  },
  {
    id: '4',
    title: 'Mathematics - Linear Algebra',
    description: 'Complete guide to linear algebra concepts',
    fileName: 'linear-algebra.pdf',
    subject: 'Mathematics',
    uploadedBy: 'Dr. Sarah Wilson',
    uploadedAt: '2024-01-20',
    fileType: 'pdf' as const
  }
];

export const mockSlotRequests = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Smith',
    subject: 'Advanced Mathematics',
    preferredDate: '2024-07-15',
    preferredTime: '14:00',
    duration: '1 hour',
    description: 'Need help with calculus integration problems',
    status: 'pending',
    requestedAt: '2024-07-05T10:30:00Z'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Sarah Johnson',
    subject: 'Physics',
    preferredDate: '2024-07-16',
    preferredTime: '10:00',
    duration: '1.5 hours',
    description: 'Quantum mechanics concepts clarification',
    status: 'approved',
    requestedAt: '2024-07-04T14:20:00Z',
    approvedAt: '2024-07-04T16:00:00Z'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Mike Wilson',
    subject: 'Chemistry',
    preferredDate: '2024-07-17',
    preferredTime: '16:00',
    duration: '2 hours',
    description: 'Organic chemistry reactions review',
    status: 'rejected',
    requestedAt: '2024-07-03T09:15:00Z',
    rejectedAt: '2024-07-03T11:30:00Z',
    rejectionReason: 'Tutor not available at requested time'
  }
];

export const mockCourses = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    description: 'Comprehensive mathematics course covering calculus, algebra, and more',
    instructor: 'Dr. Sarah Wilson',
    duration: '12 weeks',
    level: 'Advanced',
    enrolledStudents: 25,
    maxStudents: 30,
    price: 299,
    rating: 4.8,
    image: '/placeholder.svg',
    status: 'active'
  },
  {
    id: '2',
    title: 'Physics Fundamentals',
    description: 'Introduction to physics concepts and problem-solving',
    instructor: 'Prof. Michael Johnson',
    duration: '10 weeks',
    level: 'Intermediate',
    enrolledStudents: 20,
    maxStudents: 25,
    price: 249,
    rating: 4.6,
    image: '/placeholder.svg',
    status: 'active'
  },
  {
    id: '3',
    title: 'Computer Science Basics',
    description: 'Programming fundamentals and computer science concepts',
    instructor: 'Dr. Emily Chen',
    duration: '8 weeks',
    level: 'Beginner',
    enrolledStudents: 30,
    maxStudents: 35,
    price: 199,
    rating: 4.9,
    image: '/placeholder.svg',
    status: 'active'
  }
];

export const whatsappTemplates = [
  {
    id: '1',
    title: 'Class Reminder',
    template: 'Hi {{student_name}}, your {{subject}} class with {{tutor}} is starting in 1 hour. Join link: {{meeting_link}}',
    category: 'Reminders'
  },
  {
    id: '2',
    title: 'Progress Update',
    template: 'Great progress {{student_name}}! You\'ve completed {{progress}}% of your {{course_name}} course. Keep it up!',
    category: 'Progress'
  },
  {
    id: '3',
    title: 'Assignment Due',
    template: 'Don\'t forget {{student_name}}, your {{assignment_name}} assignment is due tomorrow. Submit it through the portal.',
    category: 'Assignments'
  },
  {
    id: '4',
    title: 'Welcome Message',
    template: 'Welcome to our learning platform {{student_name}}! Your enrollment in {{course_name}} is confirmed. Happy learning!',
    category: 'Welcome'
  }
];
