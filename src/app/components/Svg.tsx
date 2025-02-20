import { usePath } from "../context/PathContext";
import { Viewbox } from "../types/Viewbox";

export default function Svg({ viewbox }: { viewbox: Viewbox }) {
  const path = usePath();

  return (
    <svg
      className="w-[calc(100%-var(--aside-width))] h-full"
      viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
    >
      <path d={path} fill="#ffffff40" stroke="#fff" strokeWidth={1}></path>
    </svg>
  );
}
