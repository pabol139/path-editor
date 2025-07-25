import { useState } from "react";
import type { Viewbox } from "@/types/Viewbox";
import { usePathObject } from "@/context/PathContext";

export function usePanZoom(
  viewbox: Viewbox,
  updateViewbox: (viewbox: Viewbox) => void,
  onClick: any
) {
  const { svgRef } = usePathObject();
  const [dragging, setDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    setDragging(true);

    const svg = event.currentTarget as SVGSVGElement;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    setLastPosition({
      x: svgPoint.x,
      y: svgPoint.y,
    });
    // (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) {
      return;
    }
    setHasMoved(true);
    const svg = event.currentTarget as SVGSVGElement;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    const deltaX = -(svgPoint.x - lastPosition.x);
    const deltaY = -(svgPoint.y - lastPosition.y);

    updateViewbox({ ...viewbox, x: viewbox.x + deltaX, y: viewbox.y + deltaY });
  };

  const performZoom = (
    deltaY: number,
    anchorPoint: { x: number; y: number }
  ) => {
    let scale = 1.125;
    let scaledWidth = 0;
    let scaledHeight = 0;
    let scaledX = 0;
    let scaledY = 0;

    const svg = svgRef.current as SVGSVGElement;

    if (deltaY > 0) {
      // Zoom out
      scaledWidth = viewbox.width * scale;
      scaledHeight = viewbox.height * scale;
    } else {
      // Zoom in
      scaledWidth = viewbox.width / scale;
      scaledHeight = viewbox.height / scale;
    }

    scaledX =
      viewbox.x -
      (scaledWidth - viewbox.width) *
        (anchorPoint.x / svg.getBoundingClientRect().width);

    scaledY =
      viewbox.y -
      (scaledHeight - viewbox.height) *
        (anchorPoint.y / svg.getBoundingClientRect().height);

    updateViewbox({
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: scaledHeight,
    });
  };

  // Handle wheel events
  const handleWheelZoom = (event: React.WheelEvent<SVGSVGElement>) => {
    const svg = svgRef.current as SVGSVGElement;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    performZoom(event.deltaY, point);
  };

  // Handle programmatic zoom with anchor point
  const handleProgrammaticZoom = (
    deltaY: number,
    anchorPoint: { x: number; y: number }
  ) => {
    performZoom(deltaY, anchorPoint);
  };

  const handlePointerLeave = () => {
    setDragging(false);
    setLastPosition({ x: 0, y: 0 });
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!hasMoved && event.target === event.currentTarget) {
      onClick();
    }
    setDragging(false);
    setHasMoved(false);
    setLastPosition({ x: 0, y: 0 });
    // (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  };
  return {
    dragging,
    handleProgrammaticZoom,
    handleWheelZoom,
    handlePointerDown,
    handlePointerMove,
    handlePointerLeave,
    handlePointerUp,
  };
}
