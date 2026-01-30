import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import solviaLogoImage from "@/assets/solvia-logo.png";

interface SolviaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

const sizeConfig = {
  sm: { image: 32, text: "text-lg" },
  md: { image: 48, text: "text-2xl" },
  lg: { image: 64, text: "text-3xl" },
  xl: { image: 96, text: "text-5xl" },
};

const SolviaLogo = ({ size = "md", showText = false, className, linkTo = "/" }: SolviaLogoProps) => {
  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={solviaLogoImage} 
        alt="Solvia" 
        style={{ height: config.image }}
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
