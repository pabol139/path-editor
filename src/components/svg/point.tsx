import useDragging from "@/hooks/useDragging";
import type { Point } from "@/types/Point";
import { isTouchDevice } from "@/utils/svg";

interface PointElement {
  point: Point;
  radius: string;
  handleMove: (
    { id, x, y }: { id: string; x: number; y: number },
    updateState: boolean
  ) => void;
  handleEnter: () => void;
  handleDown: (isDragging: boolean) => void;
  handleLeave: () => void;
  handleUp: (hasMoved: boolean, isDragging: boolean) => void;
  handleClick: (
    e:
      | React.MouseEvent<SVGCircleElement, MouseEvent>
      | React.TouchEvent<SVGCircleElement>
  ) => void;
  strokeWidth: string;
}

export function Point({
  point,
  radius,
  handleMove,
  handleEnter,
  handleDown,
  handleUp,
  handleLeave,
  handleClick,
  strokeWidth,
}: PointElement) {
  const { id, control, hovered, selected, cx, cy } = point;
  const { handlers } = useDragging(id, handleMove, handleDown, handleUp);

  const fill = selected
    ? "deeppink"
    : hovered
    ? "deepskyblue"
    : control
    ? "#808080"
    : "#fff";

  const clickEvent = isTouchDevice()
    ? { onTouchEnd: handleClick }
    : { onContextMenu: handleClick };

  return (
    <circle
      role="button"
      aria-label={`Control point ${id} at ${cx}, ${cy}`}
      style={{
        fill: fill,
      }}
      className={`cursor-pointer  stroke-transparent`}
      onPointerUp={handlers.onPointerUp}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onMouseMove={(e) => e.stopPropagation()}
      {...clickEvent}
      r={radius}
      cx={cx}
      cy={cy}
      strokeWidth={strokeWidth}
      fill="currentColor"
    ></circle>
  );
}
