import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StudentCourseCardProps {
  id: string;
  title: string;
  code: string;
  section: string;
  schoolName: string;
  thumbnailUrl?: string;
  isFavorite?: boolean;
  color?: string;
  onClick?: () => void;
}

const StudentCourseCard = ({
  id,
  title,
  code,
  section,
  schoolName,
  thumbnailUrl,
  isFavorite = false,
  color = "bg-primary/20",
  onClick,
}: StudentCourseCardProps) => {
  // Convert hex color to a lighter background variant
  const getBgStyle = () => {
    if (thumbnailUrl) return {};
    // If color is a Tailwind class (starts with "bg-"), use it directly
    if (color.startsWith("bg-")) return {};
    // Otherwise treat it as a hex color and create a light background
    return { backgroundColor: `${color}20` };
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Thumbnail Area */}
      <div 
        className={`relative h-40 ${!thumbnailUrl && color.startsWith("bg-") ? color : ""} flex items-center justify-center overflow-hidden`}
        style={getBgStyle()}
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
        
        {/* Favorite Star (read-only display) */}
        {isFavorite && (
          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className="text-primary font-semibold hover:underline cursor-pointer">
          {title}
        </h3>
        <p className="text-sm text-foreground font-medium">{code}</p>
        <p className="text-xs text-muted-foreground">{schoolName}</p>
      </div>
    </Card>
  );
};

export default StudentCourseCard;

