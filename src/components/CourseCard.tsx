import { useState } from "react";
import { Star, Edit2, Image as ImageIcon, X } from "lucide-react";
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

interface CourseCardProps {
  id: string;
  title: string;
  code: string;
  section: string;
  schoolName: string;
  thumbnailUrl?: string;
  isFavorite?: boolean;
  color?: string;
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
  onThumbnailChange,
  onFavoriteToggle,
  onClick,
}: CourseCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(thumbnailUrl || "");

  const handleSaveThumbnail = () => {
    if (onThumbnailChange) {
      onThumbnailChange(id, imageUrl);
    }
    setIsEditOpen(false);
  };

  const handleRemoveThumbnail = () => {
    setImageUrl("");
    if (onThumbnailChange) {
      onThumbnailChange(id, "");
    }
    setIsEditOpen(false);
  };

  // Convert hex color to a lighter background variant
  const getBgStyle = () => {
    if (thumbnailUrl) return {};
    // If color is a Tailwind class (starts with "bg-"), use it directly
    if (color.startsWith("bg-")) return {};
    // Otherwise treat it as a hex color and create a light background
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
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Edit Course Thumbnail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnail-url">Image URL</Label>
                <Input
                  id="thumbnail-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              
              {imageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveThumbnail} className="flex-1">
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
        <p className="text-xs text-muted-foreground">{schoolName}</p>
      </div>
    </Card>
  );
};

export default CourseCard;
