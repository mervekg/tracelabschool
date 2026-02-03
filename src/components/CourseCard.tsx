import { useState, useRef } from "react";
import { Star, Edit2, Image as ImageIcon, X, Users, FileCheck, Upload, Link, Loader2, TrendingUp, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseCardProps {
  id: string;
  title: string;
  code: string;
  section: string;
  schoolName: string;
  thumbnailUrl?: string;
  isFavorite?: boolean;
  color?: string;
  studentCount?: number;
  violationCount?: number;
  pendingReviewCount?: number;
  avgScore?: number;
  onThumbnailChange?: (id: string, url: string) => void;
  onFavoriteToggle?: (id: string) => void;
  onClick?: () => void;
}

const CourseCard = ({
  id,
  title,
  code,
  section,
  schoolName,
  thumbnailUrl,
  isFavorite = false,
  color = "bg-primary/20",
  studentCount,
  violationCount,
  pendingReviewCount,
  avgScore,
  onThumbnailChange,
  onFavoriteToggle,
  onClick,
}: CourseCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(thumbnailUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(thumbnailUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${id}-${Date.now()}.${fileExt}`;
      const filePath = `class-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("assignments")
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      setImageUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleSaveThumbnail = () => {
    if (onThumbnailChange) {
      onThumbnailChange(id, previewUrl);
    }
    setIsEditOpen(false);
  };

  const handleRemoveThumbnail = () => {
    setImageUrl("");
    setPreviewUrl("");
    if (onThumbnailChange) {
      onThumbnailChange(id, "");
    }
    setIsEditOpen(false);
  };

  const handleDialogOpen = (open: boolean) => {
    setIsEditOpen(open);
    if (open) {
      setImageUrl(thumbnailUrl || "");
      setPreviewUrl(thumbnailUrl || "");
    }
  };

  // Convert hex color to a lighter background variant
  const getBgStyle = () => {
    if (thumbnailUrl) return {};
    if (color.startsWith("bg-")) return {};
    return { backgroundColor: `${color}20` };
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
      {/* Thumbnail Area */}
      <div 
        className={`relative h-40 ${!thumbnailUrl && color.startsWith("bg-") ? color : ""} flex items-center justify-center overflow-hidden`}
        style={getBgStyle()}
        onClick={onClick}
      >
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-primary/60">{title}</p>
            <p className="text-lg text-muted-foreground">{section}</p>
          </div>
        )}
        
        {/* Favorite Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <Star 
            className={`w-5 h-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>

        {/* Edit Button - shows on hover */}
        <Dialog open={isEditOpen} onOpenChange={handleDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Course Thumbnail</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Upload from computer</Label>
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnail-url">Image URL</Label>
                  <Input
                    id="thumbnail-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a direct link to an image
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={() => {
                      setPreviewUrl("");
                      toast.error("Failed to load image preview");
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveThumbnail} className="flex-1" disabled={isUploading}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Save Thumbnail
              </Button>
              {thumbnailUrl && (
                <Button 
                  variant="outline" 
                  onClick={handleRemoveThumbnail}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course Info */}
      <div className="p-4" onClick={onClick}>
        <h3 className="text-primary font-semibold hover:underline cursor-pointer">
          {title}
        </h3>
        <p className="text-sm text-foreground font-medium">{code}</p>
        {schoolName && <p className="text-xs text-muted-foreground">{schoolName}</p>}
        
        {/* Course Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
          {/* Pending Reviews */}
          <div className="flex flex-col items-center p-2 rounded-md bg-warning/10">
            <FileCheck className="w-4 h-4 text-warning mb-1" />
            <span className="text-sm font-bold text-foreground">{pendingReviewCount ?? 0}</span>
            <span className="text-[10px] text-muted-foreground leading-tight text-center">Reviews</span>
          </div>
          
          {/* Students */}
          <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
            <Users className="w-4 h-4 text-muted-foreground mb-1" />
            <span className="text-sm font-bold text-foreground">{studentCount ?? 0}</span>
            <span className="text-[10px] text-muted-foreground leading-tight text-center">Students</span>
          </div>
          
          {/* Avg Score */}
          <div className="flex flex-col items-center p-2 rounded-md bg-success/10">
            <TrendingUp className="w-4 h-4 text-success mb-1" />
            <span className="text-sm font-bold text-success">{avgScore !== undefined && avgScore > 0 ? `${avgScore}%` : "—"}</span>
            <span className="text-[10px] text-muted-foreground leading-tight text-center">Avg</span>
          </div>
          
          {/* Violations */}
          <div className="flex flex-col items-center p-2 rounded-md bg-destructive/10">
            <Shield className="w-4 h-4 text-destructive mb-1" />
            <span className="text-sm font-bold text-foreground">{violationCount ?? 0}</span>
            <span className="text-[10px] text-muted-foreground leading-tight text-center">Violations</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
