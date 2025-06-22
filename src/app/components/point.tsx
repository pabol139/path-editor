import { useState } from "react";
import { CircleType } from "@/types/Circle";

interface CircleElement extends CircleType {
  handleMove: ({ id, x, y }: { id: string; x: number; y: number }) => any;
  handleEnter: (id: string) => any;
  handleLeave: () => any;
}

export function Point({
  point,
  radius,
  handleMove,
  handleEnter,
  handleLeave,
  strokeWidth,
}: CircleElement) {
  const [dragging, setDragging] = useState(false);
  const { id, id_command, control, hovered, selected, cx, cy } = point;
  const fill = hovered ? "deepskyblue" : control ? "#808080" : "#fff";

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

  const handlePointerEnter = (event: React.PointerEvent<SVGCircleElement>) => {
    handleEnter(id_command);
  };

  return (
    <circle
      style={{
        fill: fill,
      }}
      className={`cursor-pointer  stroke-transparent`}
      onPointerLeave={(event) => {
        setDragging(false);
        handleLeave();
        event.stopPropagation();
      }}
      onPointerUp={(event) => {
        setDragging(false);
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        event.stopPropagation();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      r={radius}
      cx={cx}
      cy={cy}
      strokeWidth={strokeWidth}
      fill="currentColor"
    ></circle>
  );
}
