import { Viewbox } from "@/types/Viewbox";

const NUMBER_OF_LINES = 20;

export default function DecorativeLines({
  viewbox,
  strokeWidth,
}: {
  viewbox: Viewbox;
  strokeWidth: string;
}) {
  const vCount = NUMBER_OF_LINES;
  const hCount = NUMBER_OF_LINES;

  //   const vSpacing = viewbox.height / vCount;
  const spacing = viewbox.width / hCount;

  // world‐coordinate of the first vertical line ≤ viewbox.x
  const firstX = Math.floor(viewbox.x / spacing) * spacing;

  // number of vertical lines needed to cover the width
  const numVertLines = Math.ceil(viewbox.width / spacing) + 1;

  // same for horizontal
  const firstY = Math.floor(viewbox.y / spacing) * spacing;
  const numHorizLines = Math.ceil(viewbox.height / spacing) + 1;

  const endX = viewbox.x + viewbox.width;
  const endY = viewbox.y + viewbox.height;

  return (
    <>
      {/* Vertical grid lines */}
      {[...Array(numVertLines)].map((_, i) => {
        const x = firstX + i * spacing;
        return (
          <line
            key={`v-${i}`}
            stroke={"#ffffff05"}
            strokeWidth={strokeWidth}
            x1={x}
            x2={x}
            y1={viewbox.y}
            y2={endY}
          />
        );
      })}

      {/* Horizontal grid lines */}
      {[...Array(numHorizLines)].map((_, i) => {
        const y = firstY + i * spacing;
        return (
          <line
            key={`h-${i}`}
            stroke={"#ffffff05"}
            strokeWidth={strokeWidth}
            x1={viewbox.x}
            x2={endX}
            y1={y}
            y2={y}
          />
        );
      })}
    </>
  );
}
