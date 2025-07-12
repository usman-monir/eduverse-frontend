import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Mail, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/email/public-test`, {
        email,
      });

      if (response.data.success) {
        toast({
          title: 'Success!',
          description: 'Test email sent successfully. Check your inbox.',
        });
        setEmail('');
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to send test email',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Email System Test</h1>
          <p className="text-gray-600">Test the email functionality</p>
        </div>

        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Send Test Email</span>
            </CardTitle>
            <CardDescription>
              Enter an email address to test the email system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleTestEmail} 
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Enter a valid email address</p>
              <p>2. Click "Send Test Email"</p>
              <p>3. Check your inbox for the test email</p>
              <p>4. Verify the email template and styling</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmailTest; 