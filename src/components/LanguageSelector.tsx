import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, LANGUAGES, Language } from "@/contexts/LanguageContext";

interface LanguageSelectorProps {
  variant?: "icon" | "full";
  className?: string;
}

const LanguageSelector = ({ variant = "icon", className }: LanguageSelectorProps) => {
  const { language, setLanguage, getLanguageLabel, isTranslating } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "icon" ? "icon" : "sm"}
          className={className}
          disabled={isTranslating}
        >
          <Globe className="w-4 h-4" />
          {variant === "full" && (
            <span className="ml-2">{getLanguageLabel(language)}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            <span className="flex-1">{lang.nativeLabel}</span>
            <span className="text-xs text-muted-foreground">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
