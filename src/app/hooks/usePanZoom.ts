import { useState } from "react";
import { Viewbox } from "@/types/Viewbox";

export function usePanZoom(
  viewbox: Viewbox,
  updateViewbox: (viewbox: Viewbox) => void
) {
  const [dragging, setDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

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
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) {
      return;
    }

    const svg = event.currentTarget as SVGSVGElement;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    const deltaX = -(svgPoint.x - lastPosition.x);
    const deltaY = -(svgPoint.y - lastPosition.y);

    updateViewbox({
      width: viewbox.width,
      height: viewbox.height,
      x: viewbox.x + deltaX,
      y: viewbox.y + deltaY,
    });
  };

  const handleZoom = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();

    let scale = 1.125;
    let scaledWidth = 0;
    let scaledHeight = 0;
    let scaledX = 0;
    let scaledY = 0;

    const svg = event.currentTarget as SVGSVGElement;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    if (event.deltaY > 0) {
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
        (point.x / svg.getBoundingClientRect().width);

    scaledY =
      viewbox.y -
      (scaledHeight - viewbox.height) *
        (point.y / svg.getBoundingClientRect().height);

    updateViewbox({
      width: scaledWidth,
      height: scaledHeight,
      x: scaledX,
      y: scaledY,
    });
  };

  const handlePointerLeave = () => {
    setDragging(false);
    setLastPosition({ x: 0, y: 0 });
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    setDragging(false);
    setLastPosition({ x: 0, y: 0 });
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  };
  return {
    handleZoom,
    handlePointerDown,
    handlePointerMove,
    handlePointerLeave,
    handlePointerUp,
  };
}
