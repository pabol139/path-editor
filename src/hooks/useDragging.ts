import { useState } from "react";

export default function useDragging(
  id: string,
  handleMove: (
    { id, x, y }: { id: string; x: number; y: number },
    updateState: boolean
  ) => void,
  handleDown: (isDragging: boolean) => void,
  handleLeave: (isDragging: boolean) => void,
  handleUp: (hasMoved: boolean, isDragging: boolean) => void
) {
  const [dragging, setDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<SVGCircleElement>) => {
    setDragging(true);
    handleDown(true);

    setTimeout(() => {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }, 0);
    event.stopPropagation();
  };
  const handlePointerLeave = (event: React.PointerEvent<SVGCircleElement>) => {
    setDragging(false);
    handleLeave(false);
    event.stopPropagation();
  };

  const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
    if (!dragging) {
      return;
    }

    if (!hasMoved) {
      setHasMoved(true);
    }

    // Get the SVG element
    const svg = (event.target as HTMLElement).closest("svg");
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    handleMove(
      {
        id: id,
        x: svgPoint.x,
        y: svgPoint.y,
      },
      !hasMoved
    );
    event.stopPropagation();
  };

  const handlePointerUp = (event: React.PointerEvent<SVGCircleElement>) => {
    setDragging(false);
    setHasMoved(false);

    handleUp(hasMoved, false);

    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    event.stopPropagation();
  };

  return {
    dragging,
    hasMoved,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    },
  };
}
