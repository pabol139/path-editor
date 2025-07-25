import PathInput from "@/components/path/PathInput";
import type { Viewbox } from "@/types/Viewbox";
import type { SvgDimensions } from "@/types/Svg";

export default function PathSection({
  svgDimensions,
  updateViewbox,
}: {
  svgDimensions: SvgDimensions;
  updateViewbox: (viewbox: Viewbox) => void;
}) {
  return (
    <section className="bg-secondary px-5 py-3 sticky top-0 z-20 shadow-md">
      <h3 className="text-sm">Path</h3>
      <PathInput svgDimensions={svgDimensions} updateViewbox={updateViewbox} />
    </section>
  );
}
