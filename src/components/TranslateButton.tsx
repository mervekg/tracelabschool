import { useState, useCallback } from "react";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface TranslateButtonProps {
  text: string;
  onTranslated: (translatedText: string) => void;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

const TranslateButton = ({ text, onTranslated, className, size = "sm" }: TranslateButtonProps) => {
  const { language, translate, getLanguageLabel } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const { toast } = useToast();

  const handleTranslate = useCallback(async () => {
    if (language === "en") {
      toast({
        title: "Already in English",
        description: "Select a different language to translate.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const translated = await translate(text);
      onTranslated(translated);
      setIsTranslated(true);
      toast({
        title: "Translated",
        description: `Translated to ${getLanguageLabel(language)}`,
      });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, language, translate, onTranslated, getLanguageLabel, toast]);

  if (language === "en") return null;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleTranslate}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Languages className="w-4 h-4" />
      )}
      <span className="ml-1">
        {isTranslated ? `Translated (${getLanguageLabel(language)})` : `Translate to ${getLanguageLabel(language)}`}
      </span>
    </Button>
  );
};

export default TranslateButton;
