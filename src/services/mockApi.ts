
import { 
  mockUsers, 
  mockClassSessions, 
  mockMessages, 
  mockStudyMaterials, 
  mockSlotRequests, 
  mockCourses, 
  whatsappTemplates 
} from '@/data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  // Users
  getUsers: async () => {
    await delay(500);
    return { data: mockUsers, success: true };
  },

  getUserById: async (id: string) => {
    await delay(300);
    const user = mockUsers.find(u => u.id === id);
    return { data: user, success: !!user };
  },

  // Sessions
  getSessions: async () => {
    await delay(400);
    return { data: mockClassSessions, success: true };
  },

  getSessionById: async (id: string) => {
    await delay(300);
    const session = mockClassSessions.find(s => s.id === id);
    return { data: session, success: !!session };
  },

  createSession: async (sessionData: any) => {
    await delay(600);
    const newSession = {
      ...sessionData,
      id: Date.now().toString(),
      meetingLink: `https://meet.google.com/new-${Date.now()}`
    };
    return { data: newSession, success: true };
  },

  updateSession: async (id: string, updates: any) => {
    await delay(500);
    return { data: { id, ...updates }, success: true };
  },

  deleteSession: async (id: string) => {
    await delay(400);
    return { data: { id }, success: true };
  },

  // Messages
  getMessages: async () => {
    await delay(300);
    return { data: mockMessages, success: true };
  },

  sendMessage: async (messageData: any) => {
    await delay(700);
    const newMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    return { data: newMessage, success: true };
  },

  // Study Materials
  getStudyMaterials: async () => {
    await delay(400);
    return { data: mockStudyMaterials, success: true };
  },

  getStudyMaterialById: async (id: string) => {
    await delay(300);
    const material = mockStudyMaterials.find(m => m.id === id);
    return { data: material, success: !!material };
  },

  uploadStudyMaterial: async (materialData: any) => {
    await delay(1000);
    const newMaterial = {
      ...materialData,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    return { data: newMaterial, success: true };
  },

  // Slot Requests
  getSlotRequests: async () => {
    await delay(500);
    return { data: mockSlotRequests, success: true };
  },

  createSlotRequest: async (requestData: any) => {
    await delay(600);
    const newRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    return { data: newRequest, success: true };
  },

  updateSlotRequestStatus: async (id: string, status: string, reason?: string) => {
    await delay(500);
    const updates = {
      status,
      ...(status === 'approved' && { approvedAt: new Date().toISOString() }),
      ...(status === 'rejected' && { 
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason 
      })
    };
    return { data: { id, ...updates }, success: true };
  },

  // Courses
  getCourses: async () => {
    await delay(400);
    return { data: mockCourses, success: true };
  },

  getCourseById: async (id: string) => {
    await delay(300);
    const course = mockCourses.find(c => c.id === id);
    return { data: course, success: !!course };
  },

  createCourse: async (courseData: any) => {
    await delay(700);
    const newCourse = {
      ...courseData,
      id: Date.now().toString(),
      enrolledStudents: 0,
      rating: 0,
      status: 'active'
    };
    return { data: newCourse, success: true };
  },

  // WhatsApp Templates
  getWhatsappTemplates: async () => {
    await delay(300);
    return { data: whatsappTemplates, success: true };
  },

  sendWhatsappMessage: async (templateId: string, recipientData: any) => {
    await delay(800);
    return { 
      data: { 
        messageId: Date.now().toString(),
        status: 'sent',
        sentAt: new Date().toISOString()
      }, 
      success: true 
    };
  },

  // Authentication (mock)
  login: async (email: string, password: string) => {
    await delay(1000);
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      return { 
        data: { 
          user, 
          token: 'mock-jwt-token-' + Date.now() 
        }, 
        success: true 
      };
    }
    return { data: null, success: false, error: 'Invalid credentials' };
  },

  register: async (userData: any) => {
    await delay(1200);
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    return { 
      data: { 
        user: newUser, 
        token: 'mock-jwt-token-' + Date.now() 
      }, 
      success: true 
    };
  }
};
