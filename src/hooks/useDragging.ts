import { useLayoutEffect, useRef, useState } from "react";

export default function useDragging(
  id: string,
  handleMove: (
    { id, x, y }: { id: string; x: number; y: number },
    updateState: boolean
  ) => void,
  handleDown: (isDragging: boolean) => void,
  handleUp: (hasMoved: boolean, isDragging: boolean) => void
) {
  const [dragging, setDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const draggedPoint = useRef<SVGCircleElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  // Add pointer capture with the upfront point
  useLayoutEffect(() => {
    if (dragging && draggedPoint.current && pointerIdRef.current != null) {
      draggedPoint.current.setPointerCapture(pointerIdRef.current);
    }
  }, [dragging]);

  const handlePointerDown = (event: React.PointerEvent<SVGCircleElement>) => {
    event.preventDefault();
    setDragging(true);
    handleDown(true);
    pointerIdRef.current = event.pointerId;
    draggedPoint.current = event.currentTarget as SVGCircleElement;
    event.stopPropagation();
  };

  const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
    event.preventDefault();

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

    if ((event.target as HTMLElement).hasPointerCapture(event.pointerId)) {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }
    event.stopPropagation();
  };

  return {
    dragging,
    hasMoved,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  };
}
