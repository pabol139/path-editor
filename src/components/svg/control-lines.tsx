import type { Line } from "@/types/Line";

export default function ControlLines({
  lines,
  viewboxWidth,
  svgDimensionsWidth,
}: {
  lines: Line[];
  viewboxWidth: number;
  svgDimensionsWidth: number;
}) {
  return (
    <>
      {lines.map(({ x1, y1, x2, y2 }, index) => {
        return (
          <line
            key={index}
            stroke="gray"
            strokeWidth={String((1.5 * viewboxWidth) / svgDimensionsWidth)}
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
