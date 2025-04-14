import { useState, useEffect } from "react";

export function Circle({
  id,
  radius,
  cx,
  cy,
  fill,
  handleMove,
}: {
  id: string;
  radius: string;
  cx: string;
  cy: string;
  fill: string;
  handleMove: ({ id, x, y }: { id: string; x: number; y: number }) => any;
}) {
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
      className="hover:cursor-pointer"
      onPointerLeave={() => {
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
      fill={fill}
    ></circle>
  );
}
