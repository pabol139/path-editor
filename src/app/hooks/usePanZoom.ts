import { useState } from "react";
import { Viewbox } from "../types/Viewbox";

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
      x: String(parseFloat(viewbox.x) + deltaX),
      y: String(parseFloat(viewbox.y) + deltaY),
    });
  };

  const handleZoom = (event: React.WheelEvent<SVGSVGElement>) => {
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
      scaledWidth = parseFloat(viewbox.width) * scale;
      scaledHeight = parseFloat(viewbox.height) * scale;
    } else {
      // Zoom in
      scaledWidth = parseFloat(viewbox.width) / scale;
      scaledHeight = parseFloat(viewbox.height) / scale;
    }

    scaledX =
      parseFloat(viewbox.x) -
      (scaledWidth - parseFloat(viewbox.width)) *
        (point.x / svg.getBoundingClientRect().width);

    scaledY =
      parseFloat(viewbox.y) -
      (scaledHeight - parseFloat(viewbox.height)) *
        (point.y / svg.getBoundingClientRect().height);

    updateViewbox({
      width: String(scaledWidth),
      height: String(scaledHeight),
      x: String(scaledX),
      y: String(scaledY),
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
