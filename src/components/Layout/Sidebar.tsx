import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  Users,
  Clock,
  MessageCircle,
  User,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleComingSoon = () => {
    toast({
      title: 'Coming Soon',
      description: 'This feature is currently under development.',
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
    { path: '/student-dashboard', label: 'Dashboard', icon: Home },
    { path: '/student-sessions', label: 'My Sessions', icon: Calendar },
    { path: '/study-materials', label: 'Study Materials', icon: BookOpen },
    { path: '/book-class', label: 'Book Session', icon: Calendar },
    { path: '/request-slot', label: 'Request Slot', icon: Clock },
  ];

  const tutorNavItems = [
    { path: '/tutor-dashboard', label: 'Dashboard', icon: Home },
    { path: '/tutor/study-materials', label: 'Study Materials', icon: BookOpen },
  ];

  const adminNavItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/sessions', label: 'Sessions', icon: Calendar },
    { path: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/admin/study-materials', label: 'Study Material', icon: BookOpen },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  const getNavItems = () => {
    if (user?.role === 'admin') return adminNavItems;
    if (user?.role === 'tutor') return tutorNavItems;
    return studentNavItems;
  };

  return (
    <div className='h-full flex flex-col bg-white shadow-lg border-r border-gray-200'>
      <div className='p-6 border-b border-gray-200'>
        <h1 className='text-2xl font-bold text-blue-600'>EduPortal</h1>
        <p className='text-sm text-gray-500 mt-1'>Learning Management</p>
      </div>

      <nav className='mt-6'>
        <div className='space-y-1'>
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={getNavItemClass(item.path)}
            >
              <item.icon className='h-5 w-5' />
              <span className='font-medium'>{item.label}</span>
            </Link>
          ))}

          {/* Profile Link - Available to all users */}
          <Link
            to='/profile'
            className={getNavItemClass('/profile')}
          >
            <User className='h-5 w-5' />
            <span className='font-medium'>My Profile</span>
          </Link>

          {/* Messages - Coming Soon */}
          <div onClick={handleComingSoon} className={getComingSoonClass()}>
            <MessageSquare className='h-5 w-5' />
            <span className='font-medium'>Messages</span>
            <span className='ml-auto text-xs bg-gray-200 px-2 py-1 rounded'>
              Soon
            </span>
          </div>
        </div>
      </nav>

      <div className='mt-auto p-6 border-t border-gray-200'>
        <div className='flex items-center space-x-3 mb-4'>
          <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className='text-white text-sm font-medium'>
                {user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-900'>{user?.name}</p>
            <p className='text-xs text-gray-500 capitalize'>{user?.role}</p>
          </div>
        </div>
        <div className='space-y-2'>
          <Link
            to='/profile'
            className='w-full py-2 px-4 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium text-center block'
          >
            Edit Profile
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className='w-full py-2 px-4 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
