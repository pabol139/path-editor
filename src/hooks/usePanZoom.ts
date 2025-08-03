import { useState } from "react";
import type { Viewbox } from "@/types/Viewbox";
import { usePathObject } from "@/context/path-context";
import {
  getPointersCenter,
  getPointersDistance,
  screenToSVG,
} from "@/utils/svg";

export function usePanZoom(
  viewbox: Viewbox,
  updateViewbox: (viewbox: Viewbox) => void,
  onClick: any
) {
  const { svgRef } = usePathObject();
  const [hasMoved, setHasMoved] = useState(false);

  const [draggedEvent, setDraggedEvent] = useState<
    MouseEvent | TouchEvent | null
  >(null);

  const pinch = (
    previousEvent: MouseEvent | TouchEvent,
    currentEvent: MouseEvent | TouchEvent
  ) => {
    // Only handle pinch if both events are TouchEvents with 2+ touches
    if (
      previousEvent instanceof TouchEvent &&
      currentEvent instanceof TouchEvent &&
      previousEvent.touches.length >= 2 &&
      currentEvent.touches.length >= 2
    ) {
      // Get current touch positions in SVG coordinates
      const pt1 = screenToSVG(
        svgRef.current as SVGSVGElement,
        currentEvent.touches[0].clientX,
        currentEvent.touches[0].clientY
      );
      const pt2 = screenToSVG(
        svgRef.current as SVGSVGElement,
        currentEvent.touches[1].clientX,
        currentEvent.touches[1].clientY
      );

      const oriPt1 = screenToSVG(
        svgRef.current as SVGSVGElement,
        previousEvent.touches[0].clientX,
        previousEvent.touches[0].clientY
      );
      const oriPt2 = screenToSVG(
        svgRef.current as SVGSVGElement,
        previousEvent.touches[1].clientX,
        previousEvent.touches[1].clientY
      );

      // Calculate centers
      const center = getPointersCenter(pt1, pt2);
      const oriCenter = getPointersCenter(oriPt1, oriPt2);

      // Calculate delta (movement of center)
      const delta = { x: oriCenter.x - center.x, y: oriCenter.y - center.y };

      // Calculate zoom factor
      const oriDistance = getPointersDistance(oriPt1, oriPt2);
      const currentDistance = getPointersDistance(pt1, pt2);

      const zoom = oriDistance / currentDistance;

      return { zoom, delta, center };
    }

    return null;
  };

  const startDrag = (
    event: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    // Right click
    if (
      event.nativeEvent instanceof MouseEvent &&
      event.nativeEvent.button === 2
    ) {
      return;
    }

    setDraggedEvent(event.nativeEvent);
    setHasMoved(false);
  };

  const drag = (
    event: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    if (!draggedEvent) return;

    // For mouse events, stop dragging if button is not pressed
    if (event instanceof MouseEvent && event.buttons === 0) {
      stopDrag(event);
      return;
    }

    event.stopPropagation();

    const pinchResult = pinch(draggedEvent, event.nativeEvent);

    if (pinchResult) {
      // Handle pinch to zoom

      const w = pinchResult.zoom * viewbox.width;
      const h = pinchResult.zoom * viewbox.height;
      const x =
        viewbox.x +
        pinchResult.delta.x +
        (pinchResult.center.x - viewbox.x) * (1 - pinchResult.zoom);
      const y =
        viewbox.y +
        pinchResult.delta.y +
        (pinchResult.center.y - viewbox.y) * (1 - pinchResult.zoom);

      updateViewbox({ x, y, width: w, height: h });
    } else {
      // Handle pan

      const eventPosition =
        event.nativeEvent instanceof MouseEvent
          ? { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
          : {
              x: event.nativeEvent.touches[0].clientX,
              y: event.nativeEvent.touches[0].clientY,
            };

      const draggedEventPosition =
        draggedEvent instanceof MouseEvent
          ? { x: draggedEvent.clientX, y: draggedEvent.clientY }
          : {
              x: draggedEvent.touches[0].clientX,
              y: draggedEvent.touches[0].clientY,
            };

      const currentPt = screenToSVG(
        svgRef.current as SVGSVGElement,
        eventPosition.x,
        eventPosition.y
      );

      const originalPt = screenToSVG(
        svgRef.current as SVGSVGElement,
        draggedEventPosition.x,
        draggedEventPosition.y
      );

      updateViewbox({
        x: viewbox.x + (originalPt.x - currentPt.x),
        y: viewbox.y + (originalPt.y - currentPt.y),
        width: viewbox.width,
        height: viewbox.height,
      });
    }

    setDraggedEvent(event.nativeEvent);
    setHasMoved(true);
  };

  const stopDrag = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    if (
      !hasMoved &&
      draggedEvent &&
      (e.currentTarget === e.target || e.target instanceof SVGPathElement)
    ) {
      onClick();
    }
    setDraggedEvent(null);
    setHasMoved(false);
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

  return {
    handleProgrammaticZoom,
    handleWheelZoom,
    startDrag,
    drag,
    stopDrag,
  };
}
