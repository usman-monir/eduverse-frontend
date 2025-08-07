import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterStudent from './pages/RegisterStudent';
import RegisterTutor from './pages/RegisterTutor';
import StudentDashboard from './pages/StudentDashboard';
import StudentSessions from './pages/StudentSessions';
import TutorDashboard from './pages/TutorDashboard';
import StudyMaterials from './pages/StudyMaterials';
import BookClass from './pages/BookSession';
import RequestSlot from './pages/RequestSlot';
import Messages from './pages/Messages';
import AdminSessions from './pages/AdminSessions';
import AdminUsers from './pages/AdminUsers';
import AdminSubjects from './pages/AdminSubjects';
import WhatsAppAutomation from './pages/WhatsAppAutomation';
import NotFound from './pages/NotFound';
import AdminUserProfile from './pages/AdminUserProfile';
import UserProfile from './pages/UserProfile';
import TutorSession from './pages/TutorSession';
import SendInvitationsComponent from './pages/SendInvitationsComponent';
import AdminSmartQuad from './pages/AdminSmartQuad';
import AdminSmartQuadSessions from './pages/AdminSmartQuadSessions';
import AdminNotifications from './pages/AdminNotifications';
import SmartQuadStudentSessions from './pages/SmartQuadStudentSessions';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'tutor') return '/tutor-dashboard';
    if (user.role === 'student') return '/student-dashboard';
    return '/login';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path='/login'
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate to={getDefaultRoute()} replace />
          )
        }
      />
      <Route
        path='/register'
        element={
          !isAuthenticated ? (
            <Register />
          ) : (
            <Navigate to={getDefaultRoute()} replace />
          )
        }
      />
      <Route
        path='/register/student'
        element={
          !isAuthenticated ? (
            <RegisterStudent />
          ) : (
            <Navigate to={getDefaultRoute()} replace />
          )
        }
      />
      <Route
        path='/register/tutor'
        element={
          !isAuthenticated ? (
            <RegisterTutor />
          ) : (
            <Navigate to={getDefaultRoute()} replace />
          )
        }
      />

      {/* Student Routes */}
      <Route
        path='/student-dashboard'
        element={
          <ProtectedRoute requireRole='student'>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/student-sessions'
        element={
          <ProtectedRoute requireRole='student'>
            <StudentSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path='/smart-quad-student-sessions'
        element={
          <ProtectedRoute requireRole='student'>
            <SmartQuadStudentSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path='/study-materials'
        element={
          <ProtectedRoute>
            <StudyMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/study-materials'
        element={
          <ProtectedRoute requireRole='admin'>
            <StudyMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path='/tutor/study-materials'
        element={
          <ProtectedRoute requireRole='tutor'>
            <StudyMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path='/book-class'
        element={
          <ProtectedRoute requireRole='student'>
            <BookClass />
          </ProtectedRoute>
        }
      />
      <Route
        path='/request-slot'
        element={
          <ProtectedRoute requireRole='student'>
            <RequestSlot />
          </ProtectedRoute>
        }
      />
      <Route
        path='/messages'
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* User Profile Route - Accessible to all authenticated users */}
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Tutor Routes */}
      <Route
        path='/tutor-dashboard'
        element={
          <ProtectedRoute requireRole='tutor'>
            <TutorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/tutor/sessions'
        element={
          <ProtectedRoute requireRole='tutor'>
            <TutorSession/>
          </ProtectedRoute>
        }
      />
      {/* Admin Routes */}
      <Route
        path='/admin-dashboard'
        element={
          <ProtectedRoute requireRole='admin'>
             <AdminSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/users'
        element={
          <ProtectedRoute requireRole='admin'>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path='/send-invite'
        element={
          <ProtectedRoute requireRole='admin'>
            <SendInvitationsComponent/>  
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/users/:id'
        element={
          <ProtectedRoute requireRole='admin'>
            <AdminUserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/whatsapp'
        element={
          <ProtectedRoute requireRole='admin'>
            <WhatsAppAutomation />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/subjects'
        element={
          <ProtectedRoute requireRole='admin'>
            <AdminSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/smart-quad'
        element={
          <ProtectedRoute requireRole='admin'>
            <AdminSmartQuad />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/smart-quad/:id/sessions'
        element={
          <ProtectedRoute requireRole='admin'>
            <AdminSmartQuadSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/notifications'
        element={
          <ProtectedRoute requireRole='admin'>
            <AdminNotifications />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path='/' element={<Navigate to={getDefaultRoute()} replace />} />

      {/* 404 - NotFound must always be public and last */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
