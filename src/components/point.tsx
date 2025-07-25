import { useEffect, useState } from "react";
import type { CircleType } from "@/types/Circle";
import useDragging from "@/hooks/useDragging";

interface CircleElement extends CircleType {
  point: any;
  handleMove: (
    { id, x, y }: { id: string; x: number; y: number },
    updateState: boolean
  ) => void;
  handleEnter: () => void;
  handleLeave: () => void;
  handleDown: () => void;
  handleUp: (hasMoved: boolean) => void;
}

export function Point({
  point,
  radius,
  handleMove,
  handleEnter,
  handleLeave,
  handleDown,
  handleUp,
  handleClick,
  strokeWidth,
}: CircleElement) {
  const { id, control, hovered, selected, cx, cy } = point;
  const { handlers } = useDragging(
    id,
    handleMove,
    handleDown,
    handleLeave,
    handleUp
  );

  const fill = selected
    ? "deeppink"
    : hovered
    ? "deepskyblue"
    : control
    ? "#808080"
    : "#fff";

  return (
    <circle
      style={{
        fill: fill,
      }}
      className={`cursor-pointer  stroke-transparent`}
      onPointerLeave={handlers.onPointerLeave}
      onPointerUp={handlers.onPointerUp}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerEnter={handleEnter}
      r={radius}
      cx={cx}
      cy={cy}
      strokeWidth={strokeWidth}
      fill="currentColor"
      onContextMenu={handleClick}
    ></circle>
  );
}
