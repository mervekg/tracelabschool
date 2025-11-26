import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";

interface HandwritingCanvasProps {
  penColor: string;
  penThickness: number;
  isEraser: boolean;
  onCanvasReady?: (canvas: FabricCanvas) => void;
}

export interface HandwritingCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getImageData: () => string;
  canvas: FabricCanvas | null;
}

export const HandwritingCanvas = forwardRef<HandwritingCanvasRef, HandwritingCanvasProps>(
  ({ penColor, penThickness, isEraser, onCanvasReady }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<FabricCanvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyStepRef = useRef<number>(0);

    useEffect(() => {
      if (!canvasRef.current) return;

      // Get container dimensions
      const container = canvasRef.current.parentElement;
      const width = container?.clientWidth || 800;
      const height = container?.clientHeight || 600;

      const canvas = new FabricCanvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#ffffff",
        isDrawingMode: true,
      });

      // Configure brush for natural handwriting
      const brush = new PencilBrush(canvas);
      brush.color = penColor;
      brush.width = penThickness;
      canvas.freeDrawingBrush = brush;

      // Enable touch support
      canvas.allowTouchScrolling = false;
      
      fabricCanvasRef.current = canvas;
      
      // Initialize history
      saveHistory(canvas);

      // Save history on path creation
      canvas.on('path:created', () => {
        saveHistory(canvas);
      });

      // Handle window resize
      const handleResize = () => {
        const newWidth = container?.clientWidth || 800;
        const newHeight = container?.clientHeight || 600;
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

    // Update brush settings when props change
    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !canvas.freeDrawingBrush) return;

      if (isEraser) {
        // Eraser mode - white color
        canvas.freeDrawingBrush.color = "#ffffff";
        canvas.freeDrawingBrush.width = penThickness * 3;
      } else {
        // Drawing mode
        canvas.freeDrawingBrush.color = penColor;
        canvas.freeDrawingBrush.width = penThickness;
      }
    }, [penColor, penThickness, isEraser]);

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
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
      historyRef.current = [];
      historyStepRef.current = 0;
      saveHistory(canvas);
    };

    const getImageData = () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return "";

      return canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2 // Higher resolution for better recognition
      });
    };

    useImperativeHandle(ref, () => ({
      undo,
      redo,
      clear,
      getImageData,
      canvas: fabricCanvasRef.current
    }));

    return (
      <canvas 
        ref={canvasRef} 
        className="touch-none" 
        style={{ 
          touchAction: 'none',
          cursor: 'crosshair'
        }}
      />
    );
  }
);

HandwritingCanvas.displayName = "HandwritingCanvas";
