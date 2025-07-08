
import React, { useState } from 'react';
import { whatsappTemplates } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { MessageSquare, Send, Settings, Zap } from 'lucide-react';

const WhatsAppAutomation = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappTemplates[0]);
  const [testMessage, setTestMessage] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  const handleSendTest = () => {
    toast({
      title: "Test message sent!",
      description: "The WhatsApp message has been sent to the test number.",
    });
  };

  const categories = [...new Set(whatsappTemplates.map(t => t.category))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">WhatsApp Automation</h1>
          <p className="text-gray-600">Manage automated messaging templates and campaigns</p>
        </div>

        {/* Integration Status */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Zap className="h-5 w-5" />
              <span>Integration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">✅ Connected to Airtable</p>
                <p className="text-sm mt-1">Student data synced • Last update: 2 minutes ago</p>
                <p className="text-sm">WhatsApp Business API active • 500 messages/day limit</p>
              </div>
              <Button variant="outline" className="text-green-800 border-green-300">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Pre-configured automation messages</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {whatsappTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                        selectedTemplate?.id === template.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.title}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{template.template}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Template Editor</span>
                </CardTitle>
                <CardDescription>
                  Edit and preview message templates with dynamic variables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedTemplate && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Template Name</label>
                        <Input value={selectedTemplate.title} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <Select value={selectedTemplate.category}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Message Template</label>
                      <Textarea
                        value={selectedTemplate.template}
                        rows={4}
                        className="resize-none"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Variables: {`{{student_name}}, {{course_name}}, {{tutor}}, {{progress}}, {{meeting_link}}`}
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Preview</h4>
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                            W
                          </div>
                          <span className="font-medium text-sm">EduPortal Bot</span>
                        </div>
                        <p className="text-sm">
                          {selectedTemplate.template
                            .replace(/\{\{student_name\}\}/g, 'John Smith')
                            .replace(/\{\{course_name\}\}/g, 'Advanced Mathematics')
                            .replace(/\{\{tutor\}\}/g, 'Dr. Sarah Wilson')
                            .replace(/\{\{progress\}\}/g, '75')
                            .replace(/\{\{meeting_link\}\}/g, 'https://zoom.us/j/123456789')
                            .replace(/\{\{subject\}\}/g, 'Mathematics')
                            .replace(/\{\{assignment_name\}\}/g, 'Calculus Problem Set')}
                        </p>
                      </div>
                    </div>

                    {/* Test Message */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Test Message</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Test Phone Number</label>
                          <Input
                            placeholder="+1234567890"
                            value={testPhoneNumber}
                            onChange={(e) => setTestPhoneNumber(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleSendTest} className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Send Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Automation Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>Configure when and how messages are sent automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <h3 className="font-semibold text-blue-800">Class Reminders</h3>
                    <p className="text-sm text-blue-600 mt-1">1 hour before class</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-semibold text-purple-800">Progress Updates</h3>
                    <p className="text-sm text-purple-600 mt-1">Weekly summary</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📝</div>
                    <h3 className="font-semibold text-orange-800">Assignment Reminders</h3>
                    <p className="text-sm text-orange-600 mt-1">24 hours before due</p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">Paused</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👋</div>
                    <h3 className="font-semibold text-green-800">Welcome Messages</h3>
                    <p className="text-sm text-green-600 mt-1">On enrollment</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">1,247</div>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">98.5%</div>
              <p className="text-sm text-gray-600">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">67%</div>
              <p className="text-sm text-gray-600">Students responded</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppAutomation;
