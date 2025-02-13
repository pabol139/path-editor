import Input from "./Input";
import SectionHeader from "./SectionHeader";
import { Viewbox } from "../types/Viewbox";

type ViewboxSectionProps = {
  viewbox: Viewbox;
  setViewbox: (key: keyof Viewbox, value: number) => void;
};

const viewboxArray = [
  {
    char: "X",
    value: "x" as keyof Viewbox,
  },
  {
    char: "Y",
    value: "y" as keyof Viewbox,
  },
  {
    char: "W",
    value: "width" as keyof Viewbox,
  },
  {
    char: "H",
    value: "height" as keyof Viewbox,
  },
];

export default function ViewboxSection({
  viewbox,
  setViewbox,
}: ViewboxSectionProps) {
  return (
    <section className=" pb-5 border-b border-secondary">
      <SectionHeader title="Viewbox"></SectionHeader>
      <div className="grid px-5 w-fit mt-1 grid-cols-2 gap-2">
        {viewboxArray.map((item, index) => {
          return (
            <Input
              leftText={item.char}
              property={item.value}
              value={viewbox[item.value]}
              setter={setViewbox}
              key={index}
            />
          );
        })}
      </div>
    </section>
  );
}
