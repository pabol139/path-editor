import Input from "./inputs/Input";
import { Viewbox } from "../types/Viewbox";
import { CollapsedSection } from "./CollapsedSection";

type ViewboxSectionProps = {
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox) => void;
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
    <CollapsedSection title="Viewbox">
      <div className="grid px-5 pb-5 w-fit mt-1 grid-cols-2 gap-2">
        {viewboxArray.map((item, index) => {
          return (
            <Input
              leftText={item.char}
              value={viewbox[item.value]}
              setter={(value) => {
                const newObject = { ...viewbox };
                newObject[item.value] = value;
                updateViewbox({ ...viewbox, ...newObject });
              }}
              key={index}
            />
          );
        })}
      </div>
    </CollapsedSection>
  );
}
