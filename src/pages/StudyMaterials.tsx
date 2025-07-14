import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Eye, Shield, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getStudyMaterials, getStudyMaterialCollections, uploadStudyMaterial, deleteStudyMaterial } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

function StudyMaterialUploadDialog({ open, onClose, onUploaded, collections }: { open: boolean; onClose: () => void; onUploaded: () => void; collections: string[] }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [collection, setCollection] = React.useState('');
  const [newCollection, setNewCollection] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !file || !(collection || newCollection)) {
      setError('Please fill all required fields.');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('file', file);
    formData.append('collectionName', newCollection || collection);
    setLoading(true);
    try {
      await uploadStudyMaterial(formData);
      setLoading(false);
      onUploaded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload material');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription>Upload a new study material file (PDF, DOC, PPT, Image).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} maxLength={500} />
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} maxLength={50} />
          </div>
          <div>
            <Label>File *</Label>
            <Input type='file' accept='.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.webm,.ogg' onChange={e => setFile(e.target.files?.[0] || null)} required />
          </div>
          <div>
            <Label>Collection *</Label>
            <Select value={collection} onValueChange={setCollection} disabled={!!newCollection}>
              <SelectTrigger>
                <SelectValue placeholder='Select collection' />
              </SelectTrigger>
              <SelectContent>
                {collections.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className='mt-2'>
              <Label>Or create new collection</Label>
              <Input value={newCollection} onChange={e => setNewCollection(e.target.value)} placeholder='New collection name' maxLength={50} disabled={!!collection} />
            </div>
          </div>
          {error && <div className='text-red-500 text-sm'>{error}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <button type='button' className='px-4 py-2 rounded bg-gray-200'>Cancel</button>
            </DialogClose>
            <button type='submit' className='px-4 py-2 rounded bg-blue-600 text-white' disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudyMaterialViewer({ open, onClose, material, user }: { open: boolean; onClose: () => void; material: any; user: any }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = React.useState<number>(0);

  // Watermark text: viewer email + uploader name/email
  const watermarkText = `Viewer: ${user?.email || ''} \nUploaded by: ${material.uploadedBy?.name || material.uploadedByName || material.uploadedBy?.email || ''}`;

  // Prevent right-click, print, and selection
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (viewerRef.current && viewerRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P (print), Ctrl+S (save), Ctrl+C (copy)
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!material) return null;
  const fileUrl = material.fileUrl.startsWith('http') ? material.fileUrl : `${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${material.fileUrl}`;
  const isPDF = material.fileType === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png'].includes(material.fileType);
  const isVideo = ['mp4', 'webm', 'ogg'].includes(material.fileType);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{material.title}</DialogTitle>
          <DialogDescription>Protected viewing. Download/print/copy is disabled.</DialogDescription>
        </DialogHeader>
        <div
          ref={viewerRef}
          className='relative bg-gray-100 rounded shadow overflow-auto max-h-[70vh] flex flex-col items-center justify-start select-none'
          style={{ userSelect: 'none' }}
        >
          {/* Dynamic Watermark overlay */}
          <div
            className="pointer-events-none select-none fixed top-4 left-1/2 -translate-x-1/2 opacity-40 text-2xl font-bold text-gray-700"
            style={{
              zIndex: 9999,
              animation: 'watermark-move 4s linear infinite alternate',
              whiteSpace: 'pre',
              transform: 'translateX(0%) rotate(-20deg)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {watermarkText}
          </div>
          {/* File rendering */}
          {isPDF && (
            <div className='w-full flex flex-col items-center' style={{zIndex:1}}>
              <Document
                file={fileUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div className='p-8 text-center text-gray-500'>Loading PDF...</div>}
                error={<div className='p-8 text-center text-red-500'>Failed to load PDF.</div>}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={900}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            </div>
          )}
          {isImage && (
            <img src={fileUrl} alt={material.title} className='max-h-[70vh] max-w-full' style={{zIndex:1}} draggable={false} />
          )}
          {isVideo && (
            <video src={fileUrl} controls className='max-h-[70vh] max-w-full' style={{zIndex:1}} />
          )}
          {!isPDF && !isImage && !isVideo && (
            <div className='p-8 text-center text-gray-500'>Cannot preview this file type.</div>
          )}
        </div>
        <div className='text-xs text-gray-500 mt-2'>
          Downloading, printing, copying, and screenshots are discouraged. Content is protected.
        </div>
        <style>{`
          @keyframes watermark-move {
            0% { top: 10%; left: 5%; }
            100% { top: 60%; left: 40%; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

const StudyMaterials = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [materials, setMaterials] = useState<any[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMaterial, setViewMaterial] = useState<any | null>(null);

  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await getStudyMaterialCollections();
        setCollections(res.data.data || []);
      } catch {}
    };
    fetchCollections();
  }, []);

  React.useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (collectionFilter !== 'all') params.collectionName = collectionFilter;
        const res = await getStudyMaterials(params);
        setMaterials(res.data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to fetch study materials'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [collectionFilter]);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === 'all' || material.subject === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  const getFileTypeIcon = (fileType: string) => {
    return <FileText className='h-4 w-4' />;
  };

  const subjects = [...new Set(materials.map((m) => m.subject))];

  const handleDelete = async (material: any) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    setLoading(true);
    try {
      await deleteStudyMaterial(material._id || material.id);
      // Refresh materials and collections after delete
      const fetchCollections = async () => {
        try {
          const res = await getStudyMaterialCollections();
          setCollections(res.data.data || []);
        } catch {}
      };
      fetchCollections();
      const fetchMaterials = async () => {
        setLoading(true);
        setError(null);
        try {
          const params: any = {};
          if (collectionFilter !== 'all') params.collectionName = collectionFilter;
          const res = await getStudyMaterials(params);
          setMaterials(res.data.data || []);
        } catch (err: any) {
          setError(
            err.response?.data?.message || 'Failed to fetch study materials'
          );
        } finally {
          setLoading(false);
        }
      };
      fetchMaterials();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete material');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Loading study materials...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <p className='text-red-500'>Error loading study materials: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Study Materials</h1>
            <p className='text-gray-600'>
              Access your learning resources and study materials
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'tutor') && (
            <Button onClick={() => setShowUpload(true)}>
              + Upload Material
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <Input
              placeholder='Search materials or subjects...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by subject' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Subjects</SelectItem>
              {[...new Set(materials.map((m) => m.subject))].map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={collectionFilter} onValueChange={setCollectionFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by collection' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Collections</SelectItem>
              {collections.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold'>{materials.length}</div>
              <p className='text-sm text-gray-600'>Total Materials</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-blue-600'>
                {subjects.length}
              </div>
              <p className='text-sm text-gray-600'>Subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-green-600'>
                {materials.filter((m) => m.fileType === 'pdf').length}
              </div>
              <p className='text-sm text-gray-600'>PDF Files</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <div className='text-2xl font-bold text-purple-600'>
                Protected
              </div>
              <p className='text-sm text-gray-600'>View Only</p>
            </CardContent>
          </Card>
        </div>

        {/* Materials Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center space-x-2'>
                    {/* File type icon */}
                    <Badge variant='outline'>
                      {material.fileType?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardTitle className='text-lg'>{material.title}</CardTitle>
                <CardDescription>{material.description}</CardDescription>
                <div className='text-xs text-gray-500 mt-1'>
                  Collection: {material.collectionName || '-'}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-sm text-gray-600'>
                  <p>📚 Subject: {material.subject}</p>
                  <p>👨‍🏫 Uploaded by: {material.uploadedBy?.name || material.uploadedByName || '-'}</p>
                  <p>📅 Date: {material.uploadedAt}</p>
                  <p>📁 File: {material.fileName}</p>
                </div>
                <div className='flex space-x-2'>
                  <Button className='flex-1' onClick={() => setViewMaterial(material)}>View</Button>
                  {(user?.role === 'admin' || (user?.role === 'tutor' && (material.uploadedBy?._id === user.id || material.uploadedBy === user.id))) && (
                    <>
                      <Button variant='destructive' size='sm' onClick={() => handleDelete(material)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
                <div className='text-xs text-gray-500 bg-gray-50 p-2 rounded'>
                  Content is protected from download and screenshots
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {showUpload && <StudyMaterialUploadDialog open={showUpload} onClose={() => setShowUpload(false)} onUploaded={() => {
          setShowUpload(false);
          // Refresh materials and collections after upload
          const fetchCollections = async () => {
            try {
              const res = await getStudyMaterialCollections();
              setCollections(res.data.data || []);
            } catch {}
          };
          fetchCollections();
          const fetchMaterials = async () => {
            setLoading(true);
            setError(null);
            try {
              const params: any = {};
              if (collectionFilter !== 'all') params.collectionName = collectionFilter;
              const res = await getStudyMaterials(params);
              setMaterials(res.data.data || []);
            } catch (err: any) {
              setError(
                err.response?.data?.message || 'Failed to fetch study materials'
              );
            } finally {
              setLoading(false);
            }
          };
          fetchMaterials();
        }} collections={collections} />}
        {viewMaterial && <StudyMaterialViewer open={!!viewMaterial} onClose={() => setViewMaterial(null)} material={viewMaterial} user={user} />}
      </div>
    </DashboardLayout>
  );
};

export default StudyMaterials;
