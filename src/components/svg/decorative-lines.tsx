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

  // 3) grid math
  const CELLS = 20;
  const hPx = size.w / CELLS;
  // const vPx = size.h / CELLS;
  const unitsPerPxX = viewbox.width / size.w;
  // const unitsPerPxY = viewbox.height / size.h;
  const hSpacing = hPx * unitsPerPxX;
  // const vSpacing = vPx * unitsPerPxY;

  // 4) index ranges, using the _state_ worldBounds
  const { left, top, right, bottom } = worldBounds;
  const xStartIdx = Math.floor(left / hSpacing) - 1;
  const xEndIdx = Math.ceil(right / hSpacing) + 1;
  const yStartIdx = Math.floor(top / hSpacing) - 1;
  const yEndIdx = Math.ceil(bottom / hSpacing) + 1;

  if (
    !isFinite(xStartIdx) ||
    !isFinite(xEndIdx) ||
    !isFinite(yStartIdx) ||
    !isFinite(yEndIdx)
  )
    return <></>;

  return (
    <>
      {Array.from({ length: xEndIdx - xStartIdx + 1 }).map((_, k) => {
        const i = xStartIdx + k,
          x = i * hSpacing;
        return (
          <line
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

      {Array.from({ length: yEndIdx - yStartIdx + 1 }).map((_, k) => {
        const j = yStartIdx + k,
          y = j * hSpacing;
        return (
          <line
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
