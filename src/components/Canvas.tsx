import {
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppContext } from "../App";

const Canvas = () => {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const { sendMsg, socket } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMouseOffset, setCurrentMouseOffset] = useState<{
    x: number;
    y: number;
  }>();
  const [isDrawing, setIsDrawing] = useState(false);

  const getMousePosition = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    return {
      x: e.pageX - canvas.offsetLeft,
      y: e.pageY - canvas.offsetTop,
    };
  };

  const initCanvas = () => {
    const canvasElem = canvasRef.current;
    if (!canvasElem) return;
    const context = canvasElem?.getContext("2d");
    if (!context) return;
    const {
      x: canvasOffsetX,
      y: canvasOffsetY,
      width: canvasWidth,
      height: canvasHeight,
    } = canvasElem.getBoundingClientRect();
    context.fillRect(canvasOffsetX, canvasOffsetY, canvasWidth, canvasHeight);

    canvasElem.width = canvasWidth;
    canvasElem.height = canvasHeight;
    context.fillStyle = "#FFFFFF";
    context.strokeStyle = "black";
    context.lineJoin = "round";
    context.lineWidth = 2;
    context.stroke();
  };

  useEffect(() => {
    if (socket) {
      socket.on("paint-offset", (msg) => {
        const { origin, dest } = msg.data;
        reflectDrawing(origin, dest);
      });
    }
  }, [socket]);

  useEffect(() => {
    initCanvas();
  }, []);

  const startDrawing: MouseEventHandler<HTMLCanvasElement> = (e) => {
    // initCanvas();
    setIsDrawing(true);
    const offset = getMousePosition(e);
    if (!offset) return;
    setCurrentMouseOffset(offset);
  };

  const execDrawing: MouseEventHandler<HTMLCanvasElement> = (e) => {
    const ctx = canvasRef.current?.getContext("2d");
    const offset = getMousePosition(e);
    if (offset) {
      const { x: offsetX, y: offsetY } = offset;
      if (isDrawing && ctx && currentMouseOffset) {
        ctx.beginPath();
        //* 이전 Mouse Offset
        ctx.moveTo(currentMouseOffset.x, currentMouseOffset.y);
        //* Canvas 상 현재  Mouse Offset
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
        ctx.closePath();
        sendMsg?.("draw", { origin: currentMouseOffset, dest: offset });
        setCurrentMouseOffset({ x: offsetX, y: offsetY });
      }
    }
  };

  const reflectDrawing = (
    origin: { x: number; y: number },
    dest: { x: number; y: number }
  ) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    //* 이전 Mouse Offset
    ctx.moveTo(origin.x, origin.y);
    //* Canvas 상 현재  Mouse Offset
    ctx.lineTo(dest.x, dest.y);
    ctx.stroke();
    ctx.closePath();
  };

  const endDrawing: MouseEventHandler<HTMLCanvasElement> = () => {
    setIsDrawing(false);

    const ctx = canvasRef.current?.getContext("2d");
    console.log(ctx?.getLineDash());
  };

  return (
    <div ref={canvasWrapperRef} className="draw-canvas-wrapper">
      <canvas
        style={{ width: "100%", height: "100%" }}
        onMouseDown={startDrawing}
        onMouseMove={execDrawing}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        ref={canvasRef}
        id={"main-canvas"}
      />
    </div>
  );
};
export default Canvas;
