import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import traceLabLogoImage from "@/assets/tracelab-logo.png";

interface TraceLabLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean; // Kept for backwards compatibility, but ignored since logo includes text
  className?: string;
  linkTo?: string;
}

const sizeConfig = {
  sm: { height: 36 },
  md: { height: 48 },
  lg: { height: 64 },
  xl: { height: 80 },
};

const TraceLabLogo = ({ size = "md", className, linkTo = "/" }: TraceLabLogoProps) => {
  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex items-center", className)}>
      <img 
        src={traceLabLogoImage} 
        alt="TraceLab - Educational Assessment Platform" 
        style={{ height: config.height }}
        className="object-contain"
      />
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default TraceLabLogo;
