import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Line, Rect, Circle, Triangle, FabricObject } from "fabric";

export type BackgroundType = "blank" | "grid" | "ruled";
export type ToolType = "pen" | "eraser" | "select" | "line" | "arrow" | "rectangle" | "circle" | "rightAngle";

interface ProblemCanvasProps {
  penColor: string;
  penThickness: number;
  tool: ToolType;
  backgroundType: BackgroundType;
  onCanvasReady?: (canvas: FabricCanvas) => void;
}

export interface ProblemCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getImageData: () => string;
  canvas: FabricCanvas | null;
  addShape: (shapeType: ToolType) => void;
}

export const ProblemCanvas = forwardRef<ProblemCanvasRef, ProblemCanvasProps>(
  ({ penColor, penThickness, tool, backgroundType, onCanvasReady }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<FabricCanvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyStepRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Generate background pattern based on type
    const getBackgroundStyle = () => {
      switch (backgroundType) {
        case "grid":
          return {
            backgroundImage: `
              linear-gradient(to right, hsl(220 15% 88% / 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(220 15% 88% / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          };
        case "ruled":
          return {
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 31px,
              hsl(220 15% 85% / 0.5) 31px,
              hsl(220 15% 85% / 0.5) 32px
            )`,
            backgroundSize: "100% 32px",
          };
        default:
          return {};
      }
    };

    useEffect(() => {
      if (!canvasRef.current) return;

      const container = canvasRef.current.parentElement;
      const width = container?.clientWidth || 800;
      const height = container?.clientHeight || 600;

      setDimensions({ width, height });

      const canvas = new FabricCanvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "transparent",
        isDrawingMode: tool === "pen" || tool === "eraser",
        selection: tool === "select",
      });

      const brush = new PencilBrush(canvas);
      brush.color = penColor;
      brush.width = penThickness;
      canvas.freeDrawingBrush = brush;

      canvas.allowTouchScrolling = false;
      
      fabricCanvasRef.current = canvas;
      
      saveHistory(canvas);

      canvas.on('path:created', () => {
        saveHistory(canvas);
      });

      canvas.on('object:modified', () => {
        saveHistory(canvas);
      });

      const handleResize = () => {
        const newWidth = container?.clientWidth || 800;
        const newHeight = container?.clientHeight || 600;
        setDimensions({ width: newWidth, height: newHeight });
        canvas.setDimensions({ width: newWidth, height: newHeight });
        canvas.renderAll();
      };

      window.addEventListener('resize', handleResize);

      if (onCanvasReady) {
        onCanvasReady(canvas);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    }, []);

    // Update canvas mode when tool changes
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const isDrawingTool = tool === "pen" || tool === "eraser";
      canvas.isDrawingMode = isDrawingTool;
      canvas.selection = tool === "select";

      if (canvas.freeDrawingBrush) {
        if (tool === "eraser") {
          canvas.freeDrawingBrush.color = "#ffffff";
          canvas.freeDrawingBrush.width = penThickness * 4;
        } else {
          canvas.freeDrawingBrush.color = penColor;
          canvas.freeDrawingBrush.width = penThickness;
        }
      }
    }, [tool, penColor, penThickness]);

    const saveHistory = (canvas: FabricCanvas) => {
      const json = JSON.stringify(canvas.toJSON());
      historyRef.current = historyRef.current.slice(0, historyStepRef.current + 1);
      historyRef.current.push(json);
      historyStepRef.current = historyRef.current.length - 1;
    };

    const undo = () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || historyStepRef.current <= 0) return;

      historyStepRef.current--;
      const state = historyRef.current[historyStepRef.current];
      canvas.loadFromJSON(state, () => {
        canvas.renderAll();
      });
    };

    const redo = () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || historyStepRef.current >= historyRef.current.length - 1) return;

      historyStepRef.current++;
      const state = historyRef.current[historyStepRef.current];
      canvas.loadFromJSON(state, () => {
        canvas.renderAll();
      });
    };

    const clear = () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      canvas.clear();
      canvas.backgroundColor = "transparent";
      canvas.renderAll();
      historyRef.current = [];
      historyStepRef.current = 0;
      saveHistory(canvas);
    };

    const getImageData = () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return "";

      // Temporarily set white background for export
      const originalBg = canvas.backgroundColor;
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();

      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });

      canvas.backgroundColor = originalBg;
      canvas.renderAll();

      return dataUrl;
    };

    const addShape = (shapeType: ToolType) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      let shape: FabricObject | null = null;

      switch (shapeType) {
        case "line":
          shape = new Line([centerX - 50, centerY, centerX + 50, centerY], {
            stroke: penColor,
            strokeWidth: 2,
            selectable: true,
          });
          break;
        case "arrow":
          // Create arrow as a group (line + triangle head)
          const arrowLine = new Line([centerX - 50, centerY, centerX + 40, centerY], {
            stroke: penColor,
            strokeWidth: 2,
          });
          const arrowHead = new Triangle({
            left: centerX + 40,
            top: centerY - 8,
            width: 16,
            height: 20,
            fill: penColor,
            angle: 90,
            selectable: false,
          });
          canvas.add(arrowLine);
          canvas.add(arrowHead);
          saveHistory(canvas);
          return;
        case "rectangle":
          shape = new Rect({
            left: centerX - 50,
            top: centerY - 30,
            width: 100,
            height: 60,
            fill: "transparent",
            stroke: penColor,
            strokeWidth: 2,
            selectable: true,
          });
          break;
        case "circle":
          shape = new Circle({
            left: centerX - 40,
            top: centerY - 40,
            radius: 40,
            fill: "transparent",
            stroke: penColor,
            strokeWidth: 2,
            selectable: true,
          });
          break;
        case "rightAngle":
          // Right angle marker (L-shape)
          const size = 20;
          const rightAngle1 = new Line([centerX, centerY, centerX + size, centerY], {
            stroke: penColor,
            strokeWidth: 2,
          });
          const rightAngle2 = new Line([centerX + size, centerY, centerX + size, centerY - size], {
            stroke: penColor,
            strokeWidth: 2,
          });
          canvas.add(rightAngle1);
          canvas.add(rightAngle2);
          saveHistory(canvas);
          return;
      }

      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        saveHistory(canvas);
      }
    };

    useImperativeHandle(ref, () => ({
      undo,
      redo,
      clear,
      getImageData,
      canvas: fabricCanvasRef.current,
      addShape,
    }));

    return (
      <div 
        className="w-full h-full relative bg-white rounded-lg overflow-hidden"
        style={getBackgroundStyle()}
      >
        <canvas 
          ref={canvasRef} 
          className="touch-none absolute inset-0" 
          style={{ 
            touchAction: 'none',
            cursor: tool === "pen" ? 'crosshair' : tool === "eraser" ? 'cell' : 'default'
          }}
        />
      </div>
    );
  }
);

ProblemCanvas.displayName = "ProblemCanvas";
