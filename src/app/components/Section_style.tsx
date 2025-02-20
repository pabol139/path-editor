import Slider from "./Slider";
import InputColor from "./InputColor";
import SectionHeader from "./SectionHeader";

export default function StyleSection() {
  console.log("entro");

  return (
    <section className=" pb-5 border-b border-secondary">
      <SectionHeader title="Style"></SectionHeader>
      <div className="px-5 space-y-4">
        <h4 className="text-gray100">Fill color</h4>
        <InputColor />
        <h4 className="text-gray100">Stroke-width</h4>
        <Slider max={10} min={0} />
        <h4 className="text-gray100">Stroke-color</h4>
        <InputColor />
      </div>
    </section>
  );
}
