import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolviaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 20, text: "text-lg" },
  md: { icon: 28, text: "text-2xl" },
  lg: { icon: 36, text: "text-3xl" },
  xl: { icon: 48, text: "text-5xl" },
};

const SolviaLogo = ({ size = "md", showText = true, className }: SolviaLogoProps) => {
  const config = sizeConfig[size];

  return (
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
};

export default SolviaLogo;
