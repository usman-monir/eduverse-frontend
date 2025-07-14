import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProfile, updateProfile, changePassword } from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Lock, GraduationCap, Phone, Mail, Calendar, Shield } from 'lucide-react';

interface ProfileForm {
  name: string;
  phone: string;
  subjects: string[];
  experience: string;
  avatar: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      name: '',
      phone: '',
      subjects: [],
      experience: '',
      avatar: '',
    },
    mode: 'onChange',
  });

  const passwordForm = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      const userData = response.data.data;
      setProfileData(userData);
      
      // Update form with current data
      profileForm.reset({
        name: userData.name || '',
        phone: userData.phone || '',
        subjects: userData.subjects || [],
        experience: userData.experience || '',
        avatar: userData.avatar || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsUpdatingProfile(true);
    try {
      const updateData: any = {
        name: data.name,
        phone: data.phone,
      };

      // Add role-specific fields for tutors
      if (user?.role === 'tutor') {
        updateData.subjects = data.subjects;
        updateData.experience = data.experience;
      }

      if (data.avatar) {
        updateData.avatar = data.avatar;
      }

      const response = await updateProfile(updateData);
      
      // Update local profile data
      setProfileData(response.data.data);

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });

      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast({
        title: 'Success',
        description: 'Password changed successfully.',
      });

      // Reset password form
      passwordForm.reset();
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return null;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'tutor':
        return <GraduationCap className="h-5 w-5" />;
      case 'admin':
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <span className="text-lg">Loading profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and information</p>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {profileData?.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  getRoleIcon(user?.role || 'student')
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{profileData?.name}</h3>
                <p className="text-gray-600 flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{profileData?.email}</span>
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusBadge(profileData?.status)}
                  <Badge variant="outline" className="capitalize">
                    {profileData?.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Joined: {profileData?.joinedDate ? new Date(profileData.joinedDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Profile and Password */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          {/* Profile Settings Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        rules={{ required: 'Name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {user?.role === 'tutor' && (
                      <>
                        <FormField
                          control={profileForm.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experience</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., 5 years teaching Mathematics" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="subjects"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subjects</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Mathematics, Physics, Chemistry" 
                                  {...field}
                                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                  onChange={(e) => {
                                    const subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                    field.onChange(subjects);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={profileForm.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/avatar.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      rules={{ required: 'Current password is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your current password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      rules={{ 
                        required: 'New password is required',
                        minLength: {
                          value: 4,
                          message: 'Password must be at least 4 characters'
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your new password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      rules={{ 
                        required: 'Please confirm your new password',
                        validate: (value) => {
                          const newPassword = passwordForm.getValues('newPassword');
                          return value === newPassword || 'Passwords do not match';
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your new password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile; 