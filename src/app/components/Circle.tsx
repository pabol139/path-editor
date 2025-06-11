import { useState } from "react";
import { CircleType } from "@/types/Circle";

interface CircleElement extends CircleType {
  handleMove: ({ id, x, y }: { id: string; x: number; y: number }) => any;
}

export function Circle({
  id,
  id_command,
  radius,
  cx,
  cy,
  handleMove,
  fill,
}: CircleElement) {
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<SVGCircleElement>) => {
    setDragging(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    event.stopPropagation();
  };

  const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
    if (!dragging) {
      return;
    }

    // Get the SVG element
    const svg = (event.target as HTMLElement).closest("svg");
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    handleMove({
      id: id,
      x: parseFloat(svgPoint.x.toFixed(2)),
      y: parseFloat(svgPoint.y.toFixed(2)),
    });
    event.stopPropagation();
  };

  return (
    <circle
      style={{
        fill: fill || "#808080", // fallback color
      }}
      className={` hover:cursor-pointer hover:!fill-yellow-400`}
      onPointerLeave={(event) => {
        setDragging(false);
        event.stopPropagation();
      }}
      onPointerUp={(event) => {
        setDragging(false);
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        event.stopPropagation();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      r={radius}
      cx={cx}
      cy={cy}
      fill="currentColor"
    ></circle>
  );
}
