import type { Line } from "@/types/Line";

export default function ControlLines({
  lines,
  linesWidth,
}: {
  lines: Line[];
  linesWidth: string;
}) {
  return (
    <>
      {lines.map(({ x1, y1, x2, y2 }, index) => {
        return (
          <line
            role="presentation"
            aria-hidden="true"
            key={index}
            stroke="gray"
            strokeWidth={linesWidth}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          ></line>
        );
      })}
    </>
  );
}
