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

export const getStudyMaterials = async (params: any = {}) => {
  return api.get('/study-materials', { params });
};

export const getStudyMaterialById = async (id: string) => {
  return api.get(`/study-materials/${id}`);
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

// Slot Request APIs
export const getSlotRequests = async (params: any = {}) => {
  return api.get('/slot-requests', { params });
};

export const getSlotRequestById = async (requestId: string) => {
  return api.get(`/slot-requests/${requestId}`);
};

export const createSlotRequest = async (data: any) => {
  return api.post('/slot-requests', data);
};

export const updateSlotRequestStatus = async (
  requestId: string,
  status: string,
  assignedTutorId?: string
) => {
  return api.put(`/slot-requests/${requestId}/status`, {
    status,
    assignedTutorId,
  });
};

export const deleteSlotRequest = async (requestId: string) => {
  return api.delete(`/slot-requests/${requestId}`);
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

export default api;
