import { BookOpen, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionPanelProps {
  questionNumber?: number;
  questionText: string;
  questionImage?: string;
  subject?: string;
  points?: number;
}

const QuestionPanel = ({
  questionNumber = 1,
  questionText,
  questionImage,
  subject,
  points,
}: QuestionPanelProps) => {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/10 border-b border-border p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Question {questionNumber}
                </Badge>
                {subject && (
                  <Badge variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                )}
              </div>
              <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">
                {questionText}
              </p>
            </div>
          </div>

          {points && (
            <Badge className="bg-primary/10 text-primary border-primary/30 shrink-0">
              {points} pts
            </Badge>
          )}
        </div>

        {questionImage && (
          <div className="mt-4 ml-13 flex items-center gap-2">
            <div className="relative bg-white rounded-lg border border-border p-2 max-w-xs">
              <img
                src={questionImage}
                alt="Question diagram"
                className="max-h-32 object-contain rounded"
              />
              <div className="absolute top-1 left-1 bg-background/80 rounded px-1.5 py-0.5 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Diagram</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
