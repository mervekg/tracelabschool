import { useState, useRef } from "react";
import { Upload, FileText, Image, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadSubmissionProps {
  onFileUploaded: (url: string, fileType: string) => void;
  onFileRemoved?: () => void;
  initialFileUrl?: string | null;
  bucketName?: string;
  folderPath?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  className?: string;
}

const FileUploadSubmission = ({
  onFileUploaded,
  onFileRemoved,
  initialFileUrl = null,
  bucketName = "submissions",
  folderPath = "",
  acceptedTypes = ".pdf,.jpg,.jpeg,.png,.heic,.webp",
  maxSizeMB = 10,
  label = "Upload your work",
  description = "Drag and drop a file, or click to browse. Supports PDF, JPEG, PNG images.",
  className = "",
}: FileUploadSubmissionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialFileUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="w-8 h-8 text-primary" />;
    if (mimeType === "application/pdf") return <FileText className="w-8 h-8 text-red-500" />;
    return <FileText className="w-8 h-8 text-muted-foreground" />;
  };

  const validateFile = (file: File): boolean => {
    const maxSize = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPEG, PNG, WebP)");
      return false;
    }

    return true;
  };

  const handleFileChange = async (selectedFile: File) => {
    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }

    // Auto-upload
    await uploadFile(selectedFile);
  };

  const uploadFile = async (fileToUpload: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const sanitizedName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = folderPath
        ? `${folderPath}/${timestamp}-${sanitizedName}`
        : `${timestamp}-${sanitizedName}`;

      // Simulate progress (Supabase doesn't provide upload progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setUploadProgress(100);
      onFileUploaded(urlData.publicUrl, fileToUpload.type);
      toast.success("File uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
      setFile(null);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileRemoved?.();
  };

  const openPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      
      {!file && !initialFileUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${dragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
            }
          `}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="hidden"
          />
          
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">
            {dragActive ? "Drop your file here" : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            {uploading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Uploading...</p>
                    <p className="text-xs text-muted-foreground">{file?.name}</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="shrink-0">
                  {previewUrl && file?.type.startsWith("image/") ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ) : previewUrl && !file ? (
                    // Show existing uploaded image
                    <img 
                      src={previewUrl} 
                      alt="Uploaded file" 
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-md">
                      {getFileIcon(file?.type || "application/pdf")}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {file?.name || "Uploaded file"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file?.size 
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : "View uploaded file"
                    }
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={openPreview}
                      className="h-7 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={removeFile}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
        <span>
          For paper tests: scan or photograph your work clearly. Ensure all writing is visible.
        </span>
      </div>
    </div>
  );
};

export default FileUploadSubmission;
