export const isTouchDevice = () => {
  // Check for touch events
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Check CSS media query for pointer type
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  return hasTouch || hasCoarsePointer;
};

export const screenToSVG = (
  svg: SVGSVGElement,
  screenX: number,
  screenY: number
) => {
  const point = svg.createSVGPoint();
  point.x = screenX;
  point.y = screenY;
  return point.matrixTransform(svg.getScreenCTM()?.inverse());
};

export const svgToScreen = (svg: SVGSVGElement, svgX: number, svgY: number) => {
  const point = svg.createSVGPoint();
  const ctm = svg.getScreenCTM();
  if (!ctm)
    return {
      x: svgX,
      y: svgY,
    };
  point.x = svgX;
  point.y = svgY;

  return point.matrixTransform(ctm);
};

export const getPointersDistance = (pointer1: DOMPoint, pointer2: DOMPoint) => {
  const dx = pointer1.x - pointer2.x;
  const dy = pointer1.y - pointer2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper function to get center point between two pointers
export const getPointersCenter = (pointer1: DOMPoint, pointer2: DOMPoint) => {
  return {
    x: (pointer1.x + pointer2.x) / 2,
    y: (pointer1.y + pointer2.y) / 2,
  };
};
