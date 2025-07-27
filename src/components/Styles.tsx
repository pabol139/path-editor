import Slider from "@/components/inputs/InputSlider";
import InputColor from "@/components/inputs/InputColor";
import { CollapsedSection } from "@/components/collapsed-section";

export default function StyleSection() {
  return (
    <CollapsedSection title="Style">
      <div className="px-5 pb-5 space-y-4">
        <h4 className="text-gray100">Fill color</h4>
        <InputColor />
        <h4 className="text-gray100">Stroke-width</h4>
        <Slider max={10} min={0} />
        <h4 className="text-gray100">Stroke-color</h4>
        <InputColor />
      </div>
    </CollapsedSection>
  );
}
