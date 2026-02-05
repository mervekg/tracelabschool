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
  sm: { mobile: 28, desktop: 36 },
  md: { mobile: 36, desktop: 48 },
  lg: { mobile: 48, desktop: 64 },
  xl: { mobile: 56, desktop: 80 },
};

const TraceLabLogo = ({ size = "md", className, linkTo = "/" }: TraceLabLogoProps) => {
  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex items-center", className)}>
      {/* Mobile logo */}
      <img 
        src={traceLabLogoImage} 
        alt="TraceLab - Educational Assessment Platform" 
        className="object-contain md:hidden"
        style={{ height: config.mobile }}
      />
      {/* Desktop logo */}
      <img 
        src={traceLabLogoImage} 
        alt="TraceLab - Educational Assessment Platform" 
        className="object-contain hidden md:block"
        style={{ height: config.desktop }}
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
