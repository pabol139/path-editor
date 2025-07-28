import Input from "@/components/inputs/input";
import type { Viewbox } from "@/types/Viewbox";
import { CollapsedSection } from "@/components/collapsed-section";
import { useEffect, useState } from "react";

type ViewboxSectionProps = {
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox, adaptAspectRatio: Boolean) => void;
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

export default function Viewbox({
  viewbox,
  updateViewbox,
}: ViewboxSectionProps) {
  const [viewboxDisplay, setViewboxDisplay] = useState({
    x: String(viewbox.x),
    y: String(viewbox.y),
    width: String(viewbox.width),
    height: String(viewbox.height),
  });

  useEffect(() => {
    setViewboxDisplay({
      x: String(viewbox.x),
      y: String(viewbox.y),
      width: String(viewbox.width),
      height: String(viewbox.height),
    });
  }, [viewbox]);

  const handleSetDisplayValue = (
    value: string,
    item: {
      char: string;
      value: keyof Viewbox;
    }
  ) => {
    if (item.char === "x" || item.char === "y") {
      var formattedValue = value.replace(/,/g, ".").replace(/[^0-9\.-]/g, "");
    } else {
      var formattedValue = value.replace(/,/g, ".").replace(/[^0-9\.]/g, "");
    }
    const parsedValue = parseFloat(formattedValue);

    if (!formattedValue.endsWith(".") && parsedValue !== 0) {
      if (!isNaN(parsedValue)) {
        updateViewbox(
          {
            ...viewbox,
            [item.value]: parsedValue,
          },
          true
        );
      }
    }

    setViewboxDisplay((prevViewboxDisplay) => {
      return {
        ...prevViewboxDisplay,
        [item.value]: formattedValue,
      };
    });
  };

  const handleBlur = (item: { char: string; value: keyof Viewbox }) => {
    const newValue = parseFloat(viewboxDisplay[item.value]);
    if (!isNaN(newValue)) {
      updateViewbox(
        {
          ...viewbox,
          [item.value]: newValue,
        },
        true
      );
      setViewboxDisplay((prevViewboxDisplay) => {
        return {
          ...prevViewboxDisplay,
          [item.value]: String(newValue),
        };
      });
    } else {
      updateViewbox(
        {
          ...viewbox,
          [item.value]: 0,
        },
        true
      );
      setViewboxDisplay((prevViewboxDisplay) => {
        return { ...prevViewboxDisplay, [item.value]: "0" };
      });
    }
  };

  return (
    <CollapsedSection title="Viewbox">
      <div className="grid px-4 pb-5 w-fit grid-cols-2 gap-2">
        {viewboxArray.map((item, index) => {
          return (
            <Input
              id={item.char + index}
              leftText={item.char}
              value={viewboxDisplay[item.value]}
              setter={(value) => handleSetDisplayValue(value, item)}
              onBlur={() => handleBlur(item)}
              key={index}
            />
          );
        })}
      </div>
    </CollapsedSection>
  );
}
