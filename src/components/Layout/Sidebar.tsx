
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings,
  GraduationCap,
  Clock,
  UserPlus,
  ClipboardList,
  MessageCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleComingSoon = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is currently under development.",
    });
  };

  const getNavItemClass = (path: string) => {
    return location.pathname === path
      ? 'flex items-center space-x-3 px-4 py-3 bg-blue-100 text-blue-600 border-r-2 border-blue-600'
      : 'flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  };

  const getComingSoonClass = () => {
    return 'flex items-center space-x-3 px-4 py-3 text-gray-400 cursor-pointer hover:bg-gray-50';
  };

  const studentNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/study-materials', label: 'Study Materials', icon: BookOpen },
    { path: '/book-class', label: 'Book Class', icon: Calendar },
    { path: '/request-slot', label: 'Request Slot', icon: Clock },
  ];

  const tutorNavItems = [
    { path: '/tutor-dashboard', label: 'Dashboard', icon: Home },
    { path: '/tutor/sessions', label: 'Sessions', icon: Calendar },
    { path: '/tutor/courses', label: 'Courses', icon: BookOpen },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/sessions', label: 'Sessions', icon: Calendar },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/students', label: 'Students', icon: GraduationCap },
    { path: '/admin/slot-requests', label: 'Slot Requests', icon: ClipboardList },
    { path: '/admin/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  const getNavItems = () => {
    if (user?.role === 'admin') return adminNavItems;
    if (user?.role === 'tutor') return tutorNavItems;
    return studentNavItems;
  };

  return (
    <div className="h-full bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">EduPortal</h1>
        <p className="text-sm text-gray-500 mt-1">Learning Management</p>
      </div>

      <nav className="mt-6">
        <div className="space-y-1">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={getNavItemClass(item.path)}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Messages - Coming Soon */}
          <div
            onClick={handleComingSoon}
            className={getComingSoonClass()}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">Messages</span>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
          </div>
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
