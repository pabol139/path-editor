import Input from "./Input";
import SectionHeader from "./SectionHeader";
import { Viewbox } from "../types/Viewbox";

type ViewboxSectionProps = {
  viewbox: Viewbox;
  updateViewbox: (key: keyof Viewbox, value: string) => void;
};

const viewboxArray = [
  {
    char: "x",
    value: "x" as keyof Viewbox,
  },
  {
    char: "y",
    value: "y" as keyof Viewbox,
  },
  {
    char: "w",
    value: "width" as keyof Viewbox,
  },
  {
    char: "h",
    value: "height" as keyof Viewbox,
  },
];

export default function ViewboxSection({
  viewbox,
  updateViewbox,
}: ViewboxSectionProps) {
  return (
    <section className=" pb-5 border-b border-secondary">
      <SectionHeader title="Viewbox"></SectionHeader>
      <div className="grid px-5 w-fit mt-1 grid-cols-2 gap-2">
        {viewboxArray.map((item, index) => {
          return (
            <Input
              leftText={item.char}
              value={viewbox[item.value]}
              setter={(value) =>
                updateViewbox(item.value as keyof Viewbox, value)
              }
              key={index}
            />
          );
        })}
      </div>
    </section>
  );
}
