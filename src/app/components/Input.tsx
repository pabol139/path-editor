import { log } from "console";
import { Viewbox } from "../types/Viewbox";

type InputProps = {
  leftText: string;
  property?: keyof Viewbox;
  value: string;
  setter: (x: string, y: string) => void;
};

export default function Input({
  leftText,
  property,
  value,
  setter,
}: InputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value || "0";
    const value = parseFloat(rawValue);

    if (!isNaN(value)) {
      if (leftText.toUpperCase() === "X") {
        setter(value.toString(), "0");
      } else if (leftText.toUpperCase() === "Y") {
        setter("0", value.toString());
      }
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor={leftText}
        className="absolute uppercase w-9 text-gray200 left-0 top-0 bottom-0 flex items-center justify-center border-r border-gray300"
      >
        {leftText}
      </label>
      <input
        id={leftText}
        className="rounded-md text-sm py-2 pr-3 pl-12 max-w-28 bg-secondary"
        type="text"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
