import PathInput from "./PathInput";
import { Viewbox } from "../../types/Viewbox";
import { SvgDimensions } from "@/app/types/Svg";

export default function PathSection({
  svgDimensions,
  updateViewbox,
}: {
  svgDimensions: SvgDimensions;
  updateViewbox: (viewbox: Viewbox) => void;
}) {
  return (
    <section className="bg-secondary px-5 py-3">
      <h3 className="text-sm">Path</h3>
      <PathInput svgDimensions={svgDimensions} updateViewbox={updateViewbox} />
    </section>
  );
}
