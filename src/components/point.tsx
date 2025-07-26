import useDragging from "@/hooks/useDragging";
import type { Point } from "@/types/Point";

interface PointElement {
  point: Point;
  radius: string;
  handleMove: (
    { id, x, y }: { id: string; x: number; y: number },
    updateState: boolean
  ) => void;
  handleEnter: () => void;
  handleLeave: () => void;
  handleDown: () => void;
  handleUp: (hasMoved: boolean) => void;
  handleClick: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
  strokeWidth: string;
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
}: PointElement) {
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
