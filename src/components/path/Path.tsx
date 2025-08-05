import PathInput from "@/components/path/path-input";
import type { Viewbox } from "@/types/Viewbox";
import type { SvgDimensions } from "@/types/Svg";

export default function PathSection({
  updateViewbox,
  setSvgDimensions,
}: {
  updateViewbox: (viewbox: Viewbox) => void;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
}) {
  return (
    <section className="bg-secondary px-5 py-3 sticky top-0 z-20 shadow-md">
      <h3 className="text-sm">Path</h3>
      <PathInput
        updateViewbox={updateViewbox}
        setSvgDimensions={setSvgDimensions}
      />
    </section>
  );
}
