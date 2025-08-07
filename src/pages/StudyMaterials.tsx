import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Eye,
  Shield,
  Loader2,
  Folder,
  FolderOpen,
  Upload,
  ArrowLeft,
  File,
} from "lucide-react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStudyMaterials,
  getStudyMaterialCollections,
  uploadStudyMaterial,
  deleteStudyMaterial,
} from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

function CreateCollectionDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [collectionName, setCollectionName] = React.useState("");
  const [collectionDescription, setCollectionDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!collectionName.trim()) {
      setError("Please enter a collection name.");
      return;
    }
    setLoading(true);
    try {
      // Create a collection info file
      const formData = new FormData();
      formData.append("title", `${collectionName.trim()} - Collection Info`);
      formData.append(
        "description",
        collectionDescription.trim() ||
          `This collection contains study materials for ${collectionName.trim()}. Upload your files here to organize your learning resources.`
      );
      formData.append("subject", "Collection Management");
      formData.append("collectionName", collectionName.trim());

      // Create a collection info PDF file
      const userDescription = collectionDescription.trim()
        ? `\n\nDescription:\n${collectionDescription.trim()}`
        : "";
      const collectionInfo = `Collection: ${collectionName.trim()}

This is a collection folder for organizing study materials.${userDescription}

              Created on: ${new Date().toLocaleDateString()}

              Instructions:
              - Click "Upload to ${collectionName.trim()}" to add files
              - Use the search bar to find specific materials
              - Click "View" to preview files
              - Files are protected from download and screenshots

              Happy studying! 📚`;

      const dummyContent = "%PDF-1.4\n...";
      const dummyBlob = new Blob([dummyContent], { type: "application/pdf" });
      const dummyFile = Object.assign(dummyBlob, {
        name: `${collectionName.trim()}-collection-info.pdf`,
        lastModified: Date.now(),
      }) as File;
      formData.append("file", dummyFile);

      await uploadStudyMaterial(formData);

      setLoading(false);
      setCollectionName("");
      setCollectionDescription("");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create collection");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your study materials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Collection Name *</Label>
            <Input
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              required
              maxLength={50}
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Input
              value={collectionDescription}
              onChange={(e) => setCollectionDescription(e.target.value)}
              placeholder="Describe what this collection is for..."
              maxLength={200}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className="px-4 py-2 rounded bg-gray-200">
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Collection"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudyMaterialUploadDialog({
  open,
  onClose,
  onUploaded,
  collectionName,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
  collectionName: string;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !file) {
      setError("Please fill all required fields.");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("file", file);
    formData.append("collectionName", collectionName);
    setLoading(true);
    try {
      await uploadStudyMaterial(formData);
      setLoading(false);
      onUploaded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload material");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload to {collectionName}</DialogTitle>
          <DialogDescription>
            Upload a new study material file to this collection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={50}
            />
          </div>
          <div>
            <Label>File *</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.webm,.ogg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className="px-4 py-2 rounded bg-gray-200">
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudyMaterialViewer({
  open,
  onClose,
  material,
  user,
}: {
  open: boolean;
  onClose: () => void;
  material: any;
  user: any;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pdfBlobUrl, setPdfBlobUrl] = React.useState<string | null>(null);

  // Watermark text: viewer email + uploader name/email
  const watermarkText = `Viewer: ${user?.email || ""} \nUploaded by: ${
    material.uploadedBy?.name ||
    material.uploadedByName ||
    material.uploadedBy?.email ||
    ""
  }`;

  // Prevent right-click, print, and selection
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (viewerRef.current && viewerRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P (print), Ctrl+S (save), Ctrl+C (copy)
      if (
        (e.ctrlKey || e.metaKey) &&
        ["p", "s", "c"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Fetch PDF with Authorization header if needed
  React.useEffect(() => {
    const fetchPdf = async () => {
      if (material.fileType === "pdf") {
        const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/study-materials/${
          material.id || material._id
        }/file`;
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(fileUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error("Failed to fetch PDF");
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        } catch (err) {
          setPdfBlobUrl(null);
        }
      }
      // Cleanup blob URL on close/unmount
      return () => {
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }
      };
    };
    if (open) fetchPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, open]);

  console.log("Viewing material:", material);

  if (!material || (!material.id && !material._id)) return null;
  const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/study-materials/${
    material.id || material._id
  }/file`;

  console.log("File URL:", fileUrl);

  const isPDF = material.fileType === "pdf";
  const isImage = ["jpg", "jpeg", "png"].includes(material.fileType);
  const isVideo = ["mp4", "webm", "ogg"].includes(material.fileType);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{material.title}</DialogTitle>
          <DialogDescription>
            Protected viewing. Download/print/copy is disabled.
          </DialogDescription>
        </DialogHeader>
        <div
          ref={viewerRef}
          className="relative bg-gray-100 rounded shadow overflow-auto max-h-[70vh] flex flex-col items-center justify-start select-none"
          style={{ userSelect: "none" }}
        >
          {/* Dynamic Watermark overlay */}
          <div
            className="pointer-events-none select-none fixed top-4 left-1/2 -translate-x-1/2 opacity-40 text-2xl font-bold text-gray-700"
            style={{
              zIndex: 9999,
              animation: "watermark-move 4s linear infinite alternate",
              whiteSpace: "pre",
              transform: "translateX(0%) rotate(-20deg)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {watermarkText}
          </div>
          {/* File rendering */}
          {isPDF && (
            <div
              className="w-full flex flex-col items-center"
              style={{ zIndex: 1 }}
            >
              <Document
                file={pdfBlobUrl || undefined}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="p-8 text-center text-gray-500">
                    Loading PDF...
                  </div>
                }
                error={
                  <div className="p-8 text-center text-red-500">
                   Loading PDF
                  </div>
                }
                onLoadError={(err) => {
                  console.error("PDF load error:", err);
                }}
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
            <img
              src={fileUrl}
              alt={material.title}
              className="max-h-[70vh] max-w-full"
              style={{ zIndex: 1 }}
              draggable={false}
            />
          )}
          {isVideo && (
            <video
              src={fileUrl}
              controls
              className="max-h-[70vh] max-w-full"
              style={{ zIndex: 1 }}
            />
          )}
          {!isPDF && !isImage && !isVideo && (
            <div className="p-8 text-center text-gray-500">
              Cannot preview this file type.
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Downloading, printing, copying, and screenshots are discouraged.
          Content is protected.
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
  const [searchTerm, setSearchTerm] = useState("");
  const [collections, setCollections] = useState<string[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCollection, setCurrentCollection] = useState<string | null>(
    null
  );
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [viewMaterial, setViewMaterial] = useState<any | null>(null);

  // Group materials by collection
  const materialsByCollection = materials.reduce((acc, material) => {
    const collection = material.collectionName || "Uncategorized";
    if (!acc[collection]) {
      acc[collection] = [];
    }
    acc[collection].push(material);
    return acc;
  }, {} as Record<string, any[]>);

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
        if (currentCollection) params.collectionName = currentCollection;
        const res = await getStudyMaterials(params);
        setMaterials(res.data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch study materials"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [currentCollection]);

  const filteredMaterials = materials.filter((material) => {
    return (
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "ppt":
      case "pptx":
        return <FileText className="h-4 w-4 text-orange-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "mp4":
      case "webm":
      case "ogg":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDelete = async (material: any) => {
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;
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
          if (currentCollection) params.collectionName = currentCollection;
          const res = await getStudyMaterials(params);
          setMaterials(res.data.data || []);
        } catch (err: any) {
          setError(
            err.response?.data?.message || "Failed to fetch study materials"
          );
        } finally {
          setLoading(false);
        }
      };
      fetchMaterials();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete material");
      setLoading(false);
    }
  };

  const refreshData = async () => {
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
        if (currentCollection) params.collectionName = currentCollection;
        const res = await getStudyMaterials(params);
        setMaterials(res.data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch study materials"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading study materials...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error loading study materials: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentCollection && (
              <Button
                variant="outline"
                onClick={() => setCurrentCollection(null)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Collections
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {currentCollection ? currentCollection : "Study Materials"}
              </h1>
              <p className="text-gray-600">
                {currentCollection
                  ? `Files in ${currentCollection}`
                  : "Browse your learning resources by collection"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {!currentCollection &&
              (user?.role === "admin" || user?.role === "tutor") && (
                <Button
                  onClick={() => setShowCreateCollection(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Folder className="h-4 w-4" />
                  Create Collection
                </Button>
              )}
            {currentCollection &&
              (user?.role === "admin" || user?.role === "tutor") && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload to {currentCollection}
                </Button>
              )}
          </div>
        </div>

        {/* Search */}
        {currentCollection && (
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search files in this collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Collections View */}
        {!currentCollection && (
          <>
            {/* Collections Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{collections.length}</div>
                  <p className="text-sm text-gray-600">Collections</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {materials.length}
                  </div>
                  <p className="text-sm text-gray-600">Total Files</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    Protected
                  </div>
                  <p className="text-sm text-gray-600">View Only</p>
                </CardContent>
              </Card>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collections.map((collection) => {
                const collectionMaterials =
                  materialsByCollection[collection] || [];
                const fileCount = collectionMaterials.length;
                const subjects = [
                  ...new Set(collectionMaterials.map((m) => m.subject)),
                ];

                return (
                  <Card
                    key={collection}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => setCurrentCollection(collection)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Folder className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
                        <Badge variant="outline">{fileCount} files</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg mb-2">
                        {collection}
                      </CardTitle>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📁 {fileCount} materials</p>
                        {subjects.length > 0 && (
                          <p>
                            📚 {subjects.slice(0, 2).join(", ")}
                            {subjects.length > 2 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Files View */}
        {currentCollection && (
          <>
            {/* Files Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {filteredMaterials.length}
                  </div>
                  <p className="text-sm text-gray-600">Files</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      [...new Set(filteredMaterials.map((m) => m.subject))]
                        .length
                    }
                  </div>
                  <p className="text-sm text-gray-600">Subjects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      filteredMaterials.filter((m) => m.fileType === "pdf")
                        .length
                    }
                  </div>
                  <p className="text-sm text-gray-600">PDF Files</p>
                </CardContent>
              </Card>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getFileTypeIcon(material.fileType)}
                        <Badge variant="outline">
                          {material.fileType?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>📚 Subject: {material.subject}</p>
                      <p>
                        👨‍🏫 Uploaded by:{" "}
                        {material.uploadedBy?.name ||
                          material.uploadedByName ||
                          "-"}
                      </p>
                      <p>📅 Date: {material.uploadedAt}</p>
                      <p>📁 File: {material.fileName}</p>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button
                        className="flex-1"
                        onClick={() => setViewMaterial(material)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {(user?.role === "admin" ||
                        (user?.role === "tutor" &&
                          (material.uploadedBy?._id === user.id ||
                            material.uploadedBy === user.id))) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(material)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Content is protected from download and screenshots
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No files found in this collection
                </p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Create Collection Dialog */}
        {showCreateCollection && (
          <CreateCollectionDialog
            open={showCreateCollection}
            onClose={() => setShowCreateCollection(false)}
            onCreated={refreshData}
          />
        )}

        {/* Upload Dialog */}
        {showUpload && (
          <StudyMaterialUploadDialog
            open={showUpload}
            onClose={() => setShowUpload(false)}
            onUploaded={refreshData}
            collectionName={currentCollection || ""}
          />
        )}

        {/* Viewer Dialog */}
        {viewMaterial && (
          <StudyMaterialViewer
            open={!!viewMaterial}
            onClose={() => setViewMaterial(null)}
            material={viewMaterial}
            user={user}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudyMaterials;
