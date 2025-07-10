import React, { useState, useEffect } from 'react';
import {
  getWhatsAppTemplates,
  updateWhatsAppTemplate,
  createWhatsAppTemplate,
  getSessions,
  deleteWhatsAppTemplate,
} from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { MessageSquare, Send, Settings, Zap } from 'lucide-react';

interface WhatsAppTemplate {
  _id: string;
  title: string;
  category: string;
  template: string;
}

interface Session {
  _id: string;
  subject: string;
  tutorName: string;
  studentName?: string;
  meetingLink?: string;
  [key: string]: any;
}

const VARIABLES = [
  '{{student_name}}',
  '{{course_name}}',
  '{{tutor}}',
  '{{progress}}',
  '{{meeting_link}}',
];

// Helper to insert variable at cursor
function insertAtCursor(
  text: string,
  value: string,
  setText: (v: string) => void,
  textareaRef: React.RefObject<HTMLTextAreaElement>
) {
  const textarea = textareaRef.current;
  if (!textarea) {
    setText(text + value);
    return;
  }
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const newText = text.slice(0, start) + value + text.slice(end);
  setText(newText);
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + value.length;
  }, 0);
}

// Helper to replace variables in preview
function renderPreview(
  template: string,
  sessionVars: { key: string; value: string }[]
) {
  let result = template;
  sessionVars.forEach((v) => {
    result = result.replace(new RegExp(`{{${v.key}}}`, 'g'), v.value);
  });
  return result;
}

const WhatsAppAutomation = () => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTemplate, setEditTemplate] = useState<WhatsAppTemplate | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: '',
    template: '',
  });
  const [creating, setCreating] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const addTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [sessionLoading, setSessionLoading] = useState(true);

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      setSessionLoading(true);
      try {
        const res = await getSessions({ limit: 50 });
        setSessions(res.data.data || []);
        if (res.data.data && res.data.data.length > 0) {
          setSelectedSessionId(res.data.data[0]._id);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setSessionLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const selectedSession =
    sessions.find((s) => s._id === selectedSessionId) || sessions[0];

  // Extract available variables from selected session
  const sessionVariables = [
    selectedSession?.studentName
      ? { key: 'student_name', value: selectedSession.studentName }
      : null,
    selectedSession?.subject
      ? { key: 'course_name', value: selectedSession.subject }
      : null,
    selectedSession?.tutorName
      ? { key: 'tutor', value: selectedSession.tutorName }
      : null,
    selectedSession?.meetingLink
      ? { key: 'meeting_link', value: selectedSession.meetingLink }
      : null,
    selectedSession?.description
      ? { key: 'description', value: selectedSession.description }
      : null,
    selectedSession?.date
      ? {
          key: 'date',
          value:
            typeof selectedSession.date === 'string'
              ? selectedSession.date
              : new Date(selectedSession.date).toLocaleDateString(),
        }
      : null,
    selectedSession?.time ? { key: 'time', value: selectedSession.time } : null,
  ].filter(Boolean) as { key: string; value: string }[];

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getWhatsAppTemplates();
        setTemplates(res.data.data || []);
        setSelectedTemplate(res.data.data?.[0] || null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleEdit = () => {
    if (selectedTemplate) {
      setEditTemplate({ ...selectedTemplate });
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!editTemplate) return;
    const categoryToUse =
      editTemplate.category === 'Other'
        ? editCustomCategory
        : editTemplate.category;
    if (!editTemplate.title || !categoryToUse || !editTemplate.template) return;
    setSaving(true);
    try {
      await updateWhatsAppTemplate(editTemplate._id, {
        ...editTemplate,
        category: categoryToUse,
      });
      toast({ title: 'Template updated!', description: 'Changes saved.' });
      setTemplates((prev) =>
        prev.map((t) =>
          t._id === editTemplate._id
            ? { ...editTemplate, category: categoryToUse }
            : t
        )
      );
      setSelectedTemplate({ ...editTemplate, category: categoryToUse });
      setEditMode(false);
      setEditCustomCategory('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update template',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    const categoryToUse =
      newTemplate.category === 'Other' ? customCategory : newTemplate.category;
    if (!newTemplate.title || !categoryToUse || !newTemplate.template) return;
    setCreating(true);
    try {
      const res = await createWhatsAppTemplate({
        ...newTemplate,
        category: categoryToUse,
      });
      const created = res.data.data;
      setTemplates((prev) => [created, ...prev]);
      setSelectedTemplate(created);
      setShowNewDialog(false);
      setNewTemplate({ title: '', category: '', template: '' });
      setCustomCategory('');
      toast({ title: 'Template created!', description: 'New template added.' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create template',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?'))
      return;
    try {
      await deleteWhatsAppTemplate(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      toast({
        title: 'Template deleted',
        description: 'The template has been removed.',
      });
      // Select next template if needed
      if (selectedTemplate && selectedTemplate._id === id) {
        const next = templates.find((t) => t._id !== id);
        setSelectedTemplate(next || null);
        setEditMode(false);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <span className='text-lg'>Loading templates...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-red-500'>Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold mb-2'>WhatsApp Automation</h1>
          <p className='text-gray-600'>
            Manage automated messaging templates and campaigns
          </p>
        </div>

        {/* New Template Button */}
        <div className='flex justify-end mb-2'>
          <Button onClick={() => setShowNewDialog(true)} variant='default'>
            + New Template
          </Button>
        </div>

        {/* New Template Dialog */}
        {showNewDialog && (
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New WhatsApp Template</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new template.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <Input
                  placeholder='Title'
                  value={newTemplate.title}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, title: e.target.value })
                  }
                />
                <Select
                  value={newTemplate.category}
                  onValueChange={(val) => {
                    setNewTemplate({ ...newTemplate, category: val });
                    if (val !== 'Other') setCustomCategory('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {newTemplate.category || 'Select category'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Reminder',
                      'Progress',
                      'Assignment',
                      'Welcome',
                      'Other',
                    ].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newTemplate.category === 'Other' && (
                  <Input
                    placeholder='Custom Category'
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                )}
                <div className='mb-4'>
                  <label className='text-sm font-medium mb-2 block'>
                    Preview With Session
                  </label>
                  <Select
                    value={selectedSessionId || ''}
                    onValueChange={(val) => setSelectedSessionId(val)}
                    disabled={sessionLoading || sessions.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {selectedSession
                          ? `${selectedSession.subject} (${selectedSession.tutorName})`
                          : 'Select session'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session._id} value={session._id}>
                          {session.subject} ({session.tutorName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Variable chips */}
                <div className='flex flex-wrap gap-2'>
                  {sessionVariables.map((variable) => (
                    <button
                      key={variable.key}
                      type='button'
                      className='px-2 py-1 bg-gray-200 rounded text-xs font-mono hover:bg-gray-300 transition-colors'
                      onClick={() =>
                        insertAtCursor(
                          newTemplate.template,
                          `{{${variable.key}}}`,
                          (v) =>
                            setNewTemplate({ ...newTemplate, template: v }),
                          addTextareaRef
                        )
                      }
                    >
                      {`{{${variable.key}}}`}
                    </button>
                  ))}
                </div>
                <Textarea
                  ref={addTextareaRef}
                  placeholder='Message Template'
                  value={newTemplate.template}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, template: e.target.value })
                  }
                  rows={4}
                />
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-medium mb-2'>Preview</h4>
                  <div className='bg-white rounded-lg p-3 border'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm'>
                        W
                      </div>
                      <span className='font-medium text-sm'>EduPortal Bot</span>
                    </div>
                    <p className='text-sm'>
                      {renderPreview(newTemplate.template, sessionVariables)}
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex justify-end space-x-2 mt-4'>
                <Button
                  onClick={() => setShowNewDialog(false)}
                  variant='outline'
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    creating ||
                    !newTemplate.title ||
                    !(newTemplate.category === 'Other'
                      ? customCategory
                      : newTemplate.category) ||
                    !newTemplate.template
                  }
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Integration Status */}
        <Card className='bg-green-50 border-green-200'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2 text-green-800'>
              <Zap className='h-5 w-5' />
              <span>Integration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className='text-green-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>✅ Connected to Airtable</p>
                <p className='text-sm mt-1'>
                  Student data synced • Last update: 2 minutes ago
                </p>
                <p className='text-sm'>
                  WhatsApp Business API active • 500 messages/day limit
                </p>
              </div>
              <Button
                variant='outline'
                className='text-green-800 border-green-300'
              >
                <Settings className='h-4 w-4 mr-2' />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Templates List */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>
                  Pre-configured automation messages
                </CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='space-y-1'>
                  {templates.map((template) => (
                    <div
                      key={template._id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                        selectedTemplate?._id === template._id
                          ? 'bg-blue-50 border-blue-200'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setEditMode(false);
                      }}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='font-medium'>{template.title}</h3>
                        <Badge variant='outline'>{template.category}</Badge>
                      </div>
                      <p className='text-sm text-gray-600 truncate'>
                        {template.template}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <MessageSquare className='h-5 w-5' />
                  <span>Template Editor</span>
                </CardTitle>
                <CardDescription>
                  Edit and preview message templates with dynamic variables
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {selectedTemplate && !editMode && (
                  <>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='text-sm font-medium mb-2 block'>
                          Template Name
                        </label>
                        <Input value={selectedTemplate.title} readOnly />
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-2 block'>
                          Category
                        </label>
                        <Input value={selectedTemplate.category} readOnly />
                      </div>
                    </div>

                    <div>
                      <label className='text-sm font-medium mb-2 block'>
                        Message Template
                      </label>
                      <Textarea
                        value={selectedTemplate.template}
                        rows={4}
                        className='resize-none'
                        readOnly
                      />
                      <p className='text-xs text-gray-500 mt-2'>
                        Variables:{' '}
                        {sessionVariables.map((v) => `{{${v.key}}}`).join(', ')}
                      </p>
                    </div>

                    {/* Preview */}
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <h4 className='font-medium mb-2'>Preview</h4>
                      <div className='bg-white rounded-lg p-3 border'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm'>
                            W
                          </div>
                          <span className='font-medium text-sm'>
                            EduPortal Bot
                          </span>
                        </div>
                        <p className='text-sm'>
                          {renderPreview(
                            selectedTemplate.template,
                            sessionVariables
                          )}
                        </p>
                      </div>
                    </div>

                    <div className='flex justify-end mt-4 space-x-2'>
                      <Button onClick={handleEdit} variant='outline'>
                        Edit Template
                      </Button>
                      <Button
                        onClick={() => handleDelete(selectedTemplate._id)}
                        variant='destructive'
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}

                {editMode && editTemplate && (
                  <>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='text-sm font-medium mb-2 block'>
                          Template Name
                        </label>
                        <Input
                          value={editTemplate.title}
                          onChange={(e) =>
                            setEditTemplate({
                              ...editTemplate,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-2 block'>
                          Category
                        </label>
                        <Select
                          value={editTemplate.category}
                          onValueChange={(val) => {
                            setEditTemplate({ ...editTemplate, category: val });
                            if (val !== 'Other') setEditCustomCategory('');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {editTemplate.category || 'Select category'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              'Reminder',
                              'Progress',
                              'Assignment',
                              'Welcome',
                              'Other',
                            ].map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {editTemplate.category === 'Other' && (
                          <Input
                            placeholder='Custom Category'
                            value={editCustomCategory}
                            onChange={(e) =>
                              setEditCustomCategory(e.target.value)
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className='mb-4'>
                      <label className='text-sm font-medium mb-2 block'>
                        Preview With Session
                      </label>
                      <Select
                        value={selectedSessionId || ''}
                        onValueChange={(val) => setSelectedSessionId(val)}
                        disabled={sessionLoading || sessions.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {selectedSession
                              ? `${selectedSession.subject} (${selectedSession.tutorName})`
                              : 'Select session'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {sessions.map((session) => (
                            <SelectItem key={session._id} value={session._id}>
                              {session.subject} ({session.tutorName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Variable chips */}
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {sessionVariables.map((variable) => (
                        <button
                          key={variable.key}
                          type='button'
                          className='px-2 py-1 bg-gray-200 rounded text-xs font-mono hover:bg-gray-300 transition-colors'
                          onClick={() =>
                            insertAtCursor(
                              editTemplate.template,
                              `{{${variable.key}}}`,
                              (v) =>
                                setEditTemplate({
                                  ...editTemplate,
                                  template: v,
                                }),
                              editTextareaRef
                            )
                          }
                        >
                          {`{{${variable.key}}}`}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-2 block'>
                        Message Template
                      </label>
                      <Textarea
                        ref={editTextareaRef}
                        value={editTemplate.template}
                        onChange={(e) =>
                          setEditTemplate({
                            ...editTemplate,
                            template: e.target.value,
                          })
                        }
                        rows={4}
                        className='resize-none'
                      />
                      <p className='text-xs text-gray-500 mt-2'>
                        Variables:{' '}
                        {sessionVariables.map((v) => `{{${v.key}}}`).join(', ')}
                      </p>
                    </div>

                    <div className='flex justify-end mt-4 space-x-2'>
                      <Button
                        onClick={() => setEditMode(false)}
                        variant='outline'
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={() => handleDelete(editTemplate._id)}
                        variant='destructive'
                        disabled={saving}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <h4 className='font-medium mb-2'>Preview</h4>
                      <div className='bg-white rounded-lg p-3 border'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm'>
                            W
                          </div>
                          <span className='font-medium text-sm'>
                            EduPortal Bot
                          </span>
                        </div>
                        <p className='text-sm'>
                          {renderPreview(
                            editTemplate.template,
                            sessionVariables
                          )}
                        </p>
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
            <CardDescription>
              Configure when and how messages are sent automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card className='bg-blue-50 border-blue-200'>
                <CardContent className='p-4'>
                  <div className='text-center'>
                    <div className='text-2xl mb-2'>⏰</div>
                    <h3 className='font-semibold text-blue-800'>
                      Class Reminders
                    </h3>
                    <p className='text-sm text-blue-600 mt-1'>
                      1 hour before class
                    </p>
                    <Badge className='mt-2 bg-green-100 text-green-800'>
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-purple-50 border-purple-200'>
                <CardContent className='p-4'>
                  <div className='text-center'>
                    <div className='text-2xl mb-2'>📊</div>
                    <h3 className='font-semibold text-purple-800'>
                      Progress Updates
                    </h3>
                    <p className='text-sm text-purple-600 mt-1'>
                      Weekly summary
                    </p>
                    <Badge className='mt-2 bg-green-100 text-green-800'>
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-orange-50 border-orange-200'>
                <CardContent className='p-4'>
                  <div className='text-center'>
                    <div className='text-2xl mb-2'>📝</div>
                    <h3 className='font-semibold text-orange-800'>
                      Assignment Reminders
                    </h3>
                    <p className='text-sm text-orange-600 mt-1'>
                      24 hours before due
                    </p>
                    <Badge className='mt-2 bg-yellow-100 text-yellow-800'>
                      Paused
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-green-50 border-green-200'>
                <CardContent className='p-4'>
                  <div className='text-center'>
                    <div className='text-2xl mb-2'>👋</div>
                    <h3 className='font-semibold text-green-800'>
                      Welcome Messages
                    </h3>
                    <p className='text-sm text-green-600 mt-1'>On enrollment</p>
                    <Badge className='mt-2 bg-green-100 text-green-800'>
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppAutomation;
