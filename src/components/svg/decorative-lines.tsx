import { useEffect, useLayoutEffect, useState } from "react";
import type { Viewbox } from "@/types/Viewbox";

export default function DecorativeLines({
  viewbox,
  strokeWidth,
  svgRef,
}: {
  viewbox: Viewbox;
  strokeWidth: string;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const SPACING = 5;
  const MAX_LINES = 250;

  // 1) track CSS size
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!svgRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, [svgRef]);

  // 2) compute world‐bounds *after* viewBox changes are applied
  const [worldBounds, setWorldBounds] = useState({
    left: viewbox.x,
    top: viewbox.y,
    right: viewbox.x + viewbox.width,
    bottom: viewbox.y + viewbox.height,
  });

  useLayoutEffect(() => {
    if (!svgRef.current || size.w === 0 || size.h === 0) return;
    const svg = svgRef.current;
    const ctm = svg.getScreenCTM()!;
    const pt = svg.createSVGPoint();

    // top‑left
    pt.x = 0;
    pt.y = 0;
    const ul = pt.matrixTransform(ctm.inverse());
    // bottom‑right
    pt.x = size.w;
    pt.y = size.h;
    const lr = pt.matrixTransform(ctm.inverse());

    setWorldBounds({
      left: ul.x,
      top: ul.y,
      right: lr.x,
      bottom: lr.y,
    });
  }, [viewbox, size, svgRef]);

  if (size.w === 0 || size.h === 0) {
    // not ready to draw
    return null;
  }

  // 4) index ranges, using the _state_ worldBounds
  const { left, top, right, bottom } = worldBounds;
  const xStartIdx = Math.floor(left / SPACING);
  const xEndIdx = Math.ceil(right / SPACING);
  const yStartIdx = Math.floor(top / SPACING);
  const yEndIdx = Math.ceil(bottom / SPACING);

  const numberOfLines = xEndIdx - xStartIdx + (yEndIdx - yStartIdx);

  if (
    !isFinite(xStartIdx) ||
    !isFinite(xEndIdx) ||
    !isFinite(yStartIdx) ||
    !isFinite(yEndIdx) ||
    numberOfLines >= MAX_LINES
  )
    return <></>;

  return (
    <>
      {Array.from({ length: xEndIdx - xStartIdx }).map((_, k) => {
        const i = xStartIdx + k,
          x = i * SPACING;
        return (
          <line
            className="pointer-events-none"
            role="presentation"
            aria-hidden="true"
            key={`v-${i}`}
            stroke="#ffffff05"
            strokeWidth={strokeWidth}
            x1={x}
            x2={x}
            y1={top}
            y2={bottom}
          />
        );
      })}

      {Array.from({ length: yEndIdx - yStartIdx }).map((_, k) => {
        const j = yStartIdx + k,
          y = j * SPACING;
        return (
          <line
            className="pointer-events-none"
            role="presentation"
            aria-hidden="true"
            key={`h-${j}`}
            stroke="#ffffff05"
            strokeWidth={strokeWidth}
            x1={left}
            x2={right}
            y1={y}
            y2={y}
          />
        );
      })}
    </>
  );
}
