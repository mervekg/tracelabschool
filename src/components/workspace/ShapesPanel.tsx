import { MoveRight, ArrowRight, Square, Circle, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ToolType } from "./ProblemCanvas";

interface ShapesPanelProps {
  onAddShape: (shapeType: ToolType) => void;
}

const shapes = [
  { type: "line" as ToolType, icon: MoveRight, label: "Line" },
  { type: "arrow" as ToolType, icon: ArrowRight, label: "Arrow" },
  { type: "rectangle" as ToolType, icon: Square, label: "Rectangle" },
  { type: "circle" as ToolType, icon: Circle, label: "Circle" },
  { type: "rightAngle" as ToolType, icon: CornerDownRight, label: "Right Angle" },
];

const ShapesPanel = ({ onAddShape }: ShapesPanelProps) => {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 p-2 bg-card border border-border rounded-lg shadow-sm w-12">
        <p className="text-[10px] font-medium text-muted-foreground text-center mb-1">Shapes</p>
        {shapes.map((shape) => (
          <Tooltip key={shape.type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddShape(shape.type)}
                className="h-9 w-9"
              >
                <shape.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{shape.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default ShapesPanel;
