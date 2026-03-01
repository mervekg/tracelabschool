import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import solviaLogoImage from "@/assets/tracelab-logo.png";

interface SolviaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

const sizeConfig = {
  sm: { mobile: 28, desktop: 36 },
  md: { mobile: 36, desktop: 48 },
  lg: { mobile: 48, desktop: 64 },
  xl: { mobile: 56, desktop: 80 },
};

const SolviaLogo = ({ size = "md", className, linkTo = "/" }: SolviaLogoProps) => {
  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex items-center", className)}>
      <img 
        src={solviaLogoImage} 
        alt="Solvia - Educational Assessment Platform" 
        className="object-contain md:hidden"
        style={{ height: config.mobile }}
      />
      <img 
        src={solviaLogoImage} 
        alt="Solvia - Educational Assessment Platform" 
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

export default SolviaLogo;
