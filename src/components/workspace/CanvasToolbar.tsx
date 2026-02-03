import { Pen, Eraser, Undo2, Redo2, Trash2, Grid3X3, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ToolType, BackgroundType } from "./ProblemCanvas";

interface CanvasToolbarProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  penThickness: number;
  setPenThickness: (thickness: number) => void;
  backgroundType: BackgroundType;
  setBackgroundType: (type: BackgroundType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const colors = [
  { name: "Dark Blue", value: "#1e3a5f" },
  { name: "Black", value: "#1a1a1a" },
  { name: "Dark Green", value: "#14532d" },
  { name: "Dark Red", value: "#7f1d1d" },
];

const thicknesses = [
  { name: "Thin", value: 2 },
  { name: "Medium", value: 4 },
  { name: "Thick", value: 6 },
];

const CanvasToolbar = ({
  tool,
  setTool,
  penColor,
  setPenColor,
  penThickness,
  setPenThickness,
  backgroundType,
  setBackgroundType,
  onUndo,
  onRedo,
  onClear,
}: CanvasToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-sm">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 border-r border-border pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === "pen" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTool("pen")}
                className="h-9 w-9"
              >
                <Pen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pen Tool</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === "eraser" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTool("eraser")}
                className="h-9 w-9"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eraser</TooltipContent>
          </Tooltip>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-1 border-r border-border pr-2">
          {colors.map((color) => (
            <Tooltip key={color.value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setPenColor(color.value)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    penColor === color.value
                      ? "border-primary scale-110 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              </TooltipTrigger>
              <TooltipContent>{color.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Thickness */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div
                className="rounded-full bg-foreground"
                style={{ width: penThickness * 2, height: penThickness * 2 }}
              />
              <span className="text-xs text-muted-foreground">
                {thicknesses.find((t) => t.value === penThickness)?.name || "Medium"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="space-y-2">
              <p className="text-sm font-medium">Pen Thickness</p>
              {thicknesses.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setPenThickness(t.value)}
                  className={`flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted ${
                    penThickness === t.value ? "bg-muted" : ""
                  }`}
                >
                  <div
                    className="rounded-full bg-foreground"
                    style={{ width: t.value * 2, height: t.value * 2 }}
                  />
                  <span className="text-sm">{t.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Background Type */}
        <div className="border-l border-border pl-2">
          <ToggleGroup
            type="single"
            value={backgroundType}
            onValueChange={(value) => value && setBackgroundType(value as BackgroundType)}
            className="gap-1"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="blank" size="sm" className="h-8 px-2">
                  <div className="w-4 h-4 border border-border rounded-sm bg-white" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Blank</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="grid" size="sm" className="h-8 px-2">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Graph Paper</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="ruled" size="sm" className="h-8 px-2">
                  <Minus className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Ruled Lines</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </div>

        {/* Undo/Redo/Clear */}
        <div className="flex items-center gap-1 border-l border-border pl-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUndo} className="h-9 w-9">
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRedo} className="h-9 w-9">
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="h-9 w-9 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CanvasToolbar;
