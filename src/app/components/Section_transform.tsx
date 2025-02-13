import SectionHeader from "./SectionHeader";
import { XSquare } from "react-feather";
import Input from "./Input";
import { usePath, useSetPath } from "../context/PathContext";
import { translate } from "../utils/pathUtils";
import { useState } from "react";

type Coordinates = {
  x: string;
  y: string;
};

export default function TransformSection() {
  const path = usePath();
  const setPath = useSetPath();

  const [coordinates, setCoordinates] = useState<Coordinates>({
    x: "0",
    y: "0",
  });

  const handleTransform = (x: string, y: string) => {
    setCoordinates({ ...coordinates, x: x, y: y });
    setPath(translate(path, x, y));
  };

  return (
    <section className=" pb-5 border-b border-secondary">
      <SectionHeader title="Path Transform"></SectionHeader>
      <div className="px-5 space-y-4">
        <div>
          <h4 className="text-gray100">Translate</h4>
          <div className="flex gap-2 mt-3">
            {Array.from(["x", "y"]).map((char, index) => {
              return (
                <Input
                  leftText={char}
                  key={index}
                  value={coordinates[char as keyof Coordinates]}
                  setter={handleTransform}
                />
              );
            })}
            <button>
              <XSquare size={28}></XSquare>
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-gray100">Rotate</h4>
          <div className="flex gap-2 mt-3">
            {Array.from(["x", "y"]).map((char, index) => {
              return <Input leftText={char} key={index} />;
            })}
          </div>
        </div>
        <div>
          <h4 className="text-gray100">Scale</h4>
          <div className="flex gap-2 mt-3">
            {Array.from(["x", "y"]).map((char, index) => {
              return <Input leftText={char} key={index} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
