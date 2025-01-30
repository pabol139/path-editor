"use client";

import { useState } from "react";

export default function Slider({ max, min }: { max: number; min: number }) {
  const [value, setValue] = useState<number>(min);
  const [viewValue, setViewValue] = useState<string>(`${min}`);

  const updateValue = (rawValue: string) => {
    var value = parseFloat(rawValue);

    if (!isNaN(value)) {
      value = Math.min(max, Math.max(min, value));
      setValue(value);
      setViewValue(value.toString());
    } else {
      setValue(min);
      setViewValue("");
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value || `${min}`;
    updateValue(rawValue);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    updateValue(rawValue);
  };

  return (
    <div className="flex gap-3">
      <input
        type="range"
        id="rangeSlider"
        max={max}
        min={min}
        style={
          {
            "--input-range-progress": `${(value / max) * 100}%`,
          } as React.CSSProperties
        }
        value={value}
        onChange={handleSliderChange}
      />
      <input
        type="text"
        value={viewValue}
        onChange={handleTextChange}
        className="w-9 text-sm text-center rounded-md px-1 py-1 bg-secondary"
      />
    </div>
  );
}
