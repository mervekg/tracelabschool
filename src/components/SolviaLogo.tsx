import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import solviaLogoImage from "@/assets/solvia-logo.png";

interface SolviaLogoProps {
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

const SolviaLogo = ({ size = "md", className, linkTo = "/" }: SolviaLogoProps) => {
  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex items-center", className)}>
      <img 
        src={solviaLogoImage} 
        alt="Solvia - Educational Assessment Platform" 
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

export default SolviaLogo;
