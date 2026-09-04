import { useEffect, useRef, useState } from "react";
import { Eraser, Pen, Trash2 } from "lucide-react";

interface DrawingBoardProps {
  value: string; // base64 string
  onChange: (val: string) => void;
}

export default function DrawingBoard({ value, onChange }: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");

  // Initialize canvas with existing value or blank
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to match container (prevent blurring)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Save current content before resize
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

        // Update size
        canvas.width = width;
        canvas.height = Math.max(height, 400); // minimum height

        // Restore content
        ctx.fillStyle = "transparent"; // Or your preferred background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);

        // Setup styles
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Load initial value
    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }

    return () => resizeObserver.disconnect();
  }, []); // Run once on mount

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    
    // Style based on mode
    if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = "source-over";
      // Determine color based on current theme
      const docStyle = getComputedStyle(document.body);
      ctx.strokeStyle = docStyle.getPropertyValue('--text-primary').trim() || "#ffffff";
      ctx.lineWidth = 3;
    }
    
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
      // Save state on stroke end
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(""); // Clear state
  };

  return (
    <div className="flex flex-col gap-2 animate-fade-in h-[500px]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("pen")}
          className={`p-2 rounded-md transition-colors ${
            mode === "pen" ? "bg-accent text-white" : "bg-surface-2 text-text-muted hover:text-text-primary"
          }`}
          title="Pen Tool"
        >
          <Pen size={16} />
        </button>
        <button
          type="button"
          onClick={() => setMode("eraser")}
          className={`p-2 rounded-md transition-colors ${
            mode === "eraser" ? "bg-accent text-white" : "bg-surface-2 text-text-muted hover:text-text-primary"
          }`}
          title="Eraser Tool"
        >
          <Eraser size={16} />
        </button>
        
        <div className="flex-1" />
        
        <button
          type="button"
          onClick={clearCanvas}
          className="p-2 rounded-md bg-surface-2 text-danger hover:bg-danger hover:text-white transition-colors"
          title="Clear Board"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div 
        ref={containerRef} 
        className="flex-1 border border-border rounded-lg overflow-hidden bg-surface-0 cursor-crosshair relative"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="absolute inset-0 touch-none w-full h-full"
        />
      </div>
    </div>
  );
}
