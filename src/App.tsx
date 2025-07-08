
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterTutor from "./pages/RegisterTutor";
import Dashboard from "./pages/Dashboard";
import TutorDashboard from "./pages/TutorDashboard";
import StudyMaterials from "./pages/StudyMaterials";
import BookClass from "./pages/BookClass";
import RequestSlot from "./pages/RequestSlot";
import Messages from "./pages/Messages";
import Admin from "./pages/Admin";
import AdminSessions from "./pages/AdminSessions";
import AdminCourses from "./pages/AdminCourses";
import AdminUsers from "./pages/AdminUsers";
import AdminStudents from "./pages/AdminStudents";
import AdminSlotRequests from "./pages/AdminSlotRequests";
import WhatsAppAutomation from "./pages/WhatsAppAutomation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return "/login";
    if (user.role === 'admin') return "/admin";
    if (user.role === 'tutor') return "/tutor-dashboard";
    return "/dashboard";
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute()} replace />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to={getDefaultRoute()} replace />} 
      />
      <Route 
        path="/register/student" 
        element={!isAuthenticated ? <RegisterStudent /> : <Navigate to={getDefaultRoute()} replace />} 
      />
      <Route 
        path="/register/tutor" 
        element={!isAuthenticated ? <RegisterTutor /> : <Navigate to={getDefaultRoute()} replace />} 
      />
      
      {/* Student Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requireRole="student">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/study-materials" 
        element={
          <ProtectedRoute requireRole="student">
            <StudyMaterials />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/book-class" 
        element={
          <ProtectedRoute requireRole="student">
            <BookClass />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/request-slot" 
        element={
          <ProtectedRoute requireRole="student">
            <RequestSlot />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } 
      />
      
      {/* Tutor Routes */}
      <Route 
        path="/tutor-dashboard" 
        element={
          <ProtectedRoute requireRole="tutor">
            <TutorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tutor/sessions" 
        element={
          <ProtectedRoute requireRole="tutor">
            <AdminSessions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tutor/courses" 
        element={
          <ProtectedRoute requireRole="tutor">
            <AdminCourses />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireRole="admin">
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/sessions" 
        element={
          <ProtectedRoute requireRole="admin">
            <AdminSessions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/courses" 
        element={
          <ProtectedRoute requireRole="admin">
            <AdminCourses />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requireRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/students" 
        element={
          <ProtectedRoute requireRole="admin">
            <AdminStudents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/slot-requests" 
        element={
          <ProtectedRoute requireRole="admin">
            <AdminSlotRequests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/whatsapp" 
        element={
          <ProtectedRoute requireRole="admin">
            <WhatsAppAutomation />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          <Navigate to={getDefaultRoute()} replace />
        } 
      />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
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
