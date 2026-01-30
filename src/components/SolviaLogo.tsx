import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SolviaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

const sizeConfig = {
  sm: { icon: 20, text: "text-lg" },
  md: { icon: 28, text: "text-2xl" },
  lg: { icon: 36, text: "text-3xl" },
  xl: { icon: 48, text: "text-5xl" },
};

const SolviaLogo = ({ size = "md", showText = true, className, linkTo = "/" }: SolviaLogoProps) => {
  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-sm opacity-50" />
        <div className="relative p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
          <GraduationCap 
            size={config.icon} 
            className="text-primary-foreground" 
            strokeWidth={2}
          />
        </div>
      </div>
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent",
          config.text
        )}>
          Solvia
        </span>
      )}
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
