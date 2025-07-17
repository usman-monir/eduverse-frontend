import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Add interceptor to attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerStudent = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  grade: string;
  subjects: string[];
}) => {
  return api.post('/auth/register', {
    ...data,
    role: 'student',
  });
};

export const registerTutor = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  subjects: string[];
  experience: string;
  qualifications: string;
}) => {
  return api.post('/auth/register', {
    ...data,
    role: 'tutor',
  });
};

export const login = async (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

export const getProfile = async () => {
  return api.get('/auth/me');
};

export const updateProfile = async (data: {
  name?: string;
  phone?: string;
  subjects?: string[];
  experience?: string;
  avatar?: string;
}) => {
  return api.put('/auth/me', data);
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return api.put('/auth/change-password', data);
};

export const getStudyMaterials = async (params: any = {}) => {
  return api.get('/study-materials', { params });
};

export const getStudyMaterialById = async (id: string) => {
  return api.get(`/study-materials/${id}`);
};

export const getStudents = async () => {
  return api.get('/admin/users', {
    params: { role: 'student', limit: 100 },
  });
};

export const uploadStudyMaterial = async (formData: FormData) => {
  return api.post('/study-materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getStudyMaterialCollections = async () => {
  return api.get('/study-materials/collections');
};

export const updateStudyMaterial = async (id: string, data: any) => {
  return api.put(`/study-materials/${id}`, data);
};


export const deleteStudyMaterial = async (id: string) => {
  return api.delete(`/study-materials/${id}`);
};

// Session APIs
export const getSessions = async (params: any = {}) => {
  return api.get('/sessions', { params });
};

export const getSessionById = async (sessionId: string) => {
  return api.get(`/sessions/${sessionId}`);
};

export const createSession = async (data: any) => {
  return api.post('/sessions', data);
};

export const updateSession = async (sessionId: string, data: any) => {
  return api.put(`/sessions/${sessionId}`, data);
};

export const bookSession = async (sessionId: string, data: any) => {
  return api.put(`/sessions/${sessionId}/book`, data);
};

 
export const updateSessionStatus = async (
  sessionId: string,
  status: string
) => {
  return api.put(`/sessions/${sessionId}/status`, { status });
};

export const deleteSession = async (sessionId: string) => {
  return api.delete(`/sessions/${sessionId}`);
};

export const getAvailableTutors = async () => {
  return api.get('/sessions/tutors/available');
};

// New Session APIs
export const getMySessions = async (params: any = {}) => {
  return api.get('/sessions/my', { params });
};

export const createSessionSlotRequest = async (data: any) => {
  return api.post('/sessions/request', data);
};

export const approveSlotRequest = async (sessionId: string, approved: boolean, notes?: string) => {
  return api.put(`/sessions/${sessionId}/approve`, { approved, notes });
};

// WhatsApp Templates APIs
export const getWhatsAppTemplates = async () => {
  return api.get('/whatsapp/templates');
};

export const updateWhatsAppTemplate = async (id: string, data: any) => {
  return api.put(`/whatsapp/templates/${id}`, data);
};

export const createWhatsAppTemplate = async (data: any) => {
  return api.post('/whatsapp/templates', data);
};

export const deleteWhatsAppTemplate = async (id: string) => {
  return api.delete(`/whatsapp/templates/${id}`);
};

export const getAdminUsers = async (params: any = {}) => {
  return api.get('/admin/users', { params });
};

export const getAdminUserById = async (id: string) => {
  return api.get(`/admin/users/${id}`);
};

export const getAllTutorsWithSubjects = async () => {
  return api.get('/admin/tutors');
};

export const approveUser = async (userId: string) => {
  return api.put(`/admin/users/${userId}/approve`);
};

export const inviteUser = async (data: {
  name: string;
  email: string;
  role: 'student' | 'tutor';
  temporaryPassword: string;
  phone?: string;
  subjects?: string[];
  experience?: string;
}) => {
  return api.post('/admin/users/invite', data);
};

// Subject APIs
export const getSubjects = async (params?: any) => {
  return api.get('/subjects', { params });
};

export const getSubjectById = async (id: string) => {
  return api.get(`/subjects/${id}`);
};

export const createSubject = async (data: {
  name: string;
  description?: string;
  category?: string;
}) => {
  return api.post('/subjects', data);
};

export const updateSubject = async (id: string, data: {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}) => {
  return api.put(`/subjects/${id}`, data);
};

export const deleteSubject = async (id: string) => {
  return api.delete(`/subjects/${id}`);
};

export const toggleSubjectStatus = async (id: string) => {
  return api.put(`/subjects/${id}/toggle`);
};


// Get availability for a specific tutor
export const getTutorAvailability = async (tutorId: string) => {
  return api.get(`/tutors/${tutorId}/availability`);
};

// Update availability for a specific tutor
export const updateTutorAvailability = async (
  tutorId: string,
  updatedAvailability: {
    [day: string]: { start: string; end: string };
  }
) => {
  return api.put(`/tutors/${tutorId}/availability`, updatedAvailability);
};


export const createMeetingLink = async (data: {
  startTime: string;
  endTime: string;
  tutorName: string;
}) => {
  const { startTime, endTime, tutorName } = data;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const selectedDate = startTime.split("T")[0];
  const selectedTime = new Date(startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const localDateTimeString = new Date(startTime).toLocaleString();

  const payload = {
    summary: `1-on-1 Session with ${tutorName}`,
    startTime,
    endTime,
    timeZone,
    selectedDate,
    selectedTime,
    localDateTimeString,
  };

  try {
    const res = await api.post('/create-meeting', payload);
    return res.data.meetLink;
  } catch (error) {
    console.error('Error creating meeting link:', error);
    throw error;
  }
};


export default api;


