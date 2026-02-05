import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Upload } from "lucide-react";
import FileUploadSubmission from "@/components/FileUploadSubmission";

interface SubmissionInputTabsProps {
  // Canvas props for handwriting
  canvasContent: React.ReactNode;
  // Upload callback
  onFileUploaded: (url: string, fileType: string) => void;
  onFileRemoved?: () => void;
  // Configuration
  studentId?: string;
  assignmentId?: string;
  initialTab?: "handwriting" | "upload";
  uploadLabel?: string;
  uploadDescription?: string;
  className?: string;
}

const SubmissionInputTabs = ({
  canvasContent,
  onFileUploaded,
  onFileRemoved,
  studentId,
  assignmentId,
  initialTab = "handwriting",
  uploadLabel = "Upload your work",
  uploadDescription = "Take a photo of your paper test or upload a PDF/image file.",
  className = "",
}: SubmissionInputTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Build folder path for storage organization
  const folderPath = assignmentId 
    ? `${assignmentId}${studentId ? `/${studentId}` : ""}`
    : "";

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="handwriting" className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Write on Screen</span>
            <span className="sm:hidden">Handwrite</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="handwriting" className="mt-0">
          {canvasContent}
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <FileUploadSubmission
            onFileUploaded={onFileUploaded}
            onFileRemoved={onFileRemoved}
            bucketName="submissions"
            folderPath={folderPath}
            label={uploadLabel}
            description={uploadDescription}
            maxSizeMB={10}
          />

          {/* Additional guidance for paper test uploads */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Tips for uploading paper work:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Ensure good lighting and a clear, focused photo</li>
              <li>• Place paper on a flat, contrasting surface</li>
              <li>• Make sure all handwriting is visible and readable</li>
              <li>• PDF files are preferred for multi-page submissions</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubmissionInputTabs;
