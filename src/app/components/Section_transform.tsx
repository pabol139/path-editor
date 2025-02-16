import SectionHeader from "./SectionHeader";
import Input from "./Input";
import { usePath, useSetPath } from "../context/PathContext";
import { translate } from "../utils/pathUtils";
import { useState } from "react";

type Coordinates = {
  translate: AxisValues;
  rotate: AxisValues;
  scale: AxisValues;
};

type Axis = "x" | "y";

type AxisValues = {
  x: string;
  y: string;
};

type Action = "translate" | "rotate" | "scale";

const axis = ["x", "y"];

export default function TransformSection() {
  const path = usePath();
  const setPath = useSetPath();

  const [coordinates, setCoordinates] = useState<Coordinates>({
    translate: {
      x: "0",
      y: "0",
    },
    rotate: {
      x: "0",
      y: "0",
    },
    scale: {
      x: "0",
      y: "0",
    },
  });

  const updatePosition = (action: Action, axis: Axis, value: string) => {
    setCoordinates((prev) => ({
      ...prev,
      [action]: { ...prev[action], [axis]: value },
    }));
  };

  const handleTranslate = () => {
    setPath(
      translate(path, coordinates["translate"].x, coordinates["translate"].y)
    );
  };
  const handleRotate = () => {
    // setPath(
    //   rotate(path, coordinates["rotate"].x, coordinates["rotate"].y)
    // );
  };
  const handleScale = () => {
    // setPath(
    //   scale(path, coordinates["scale"].x, coordinates["scale"].y)
    // );
  };

  return (
    <section className=" pb-5 border-b border-secondary">
      <SectionHeader title="Path Transform"></SectionHeader>
      <div className="px-5 space-y-4">
        <div>
          <h4 className="text-gray100">Translate</h4>
          <div className="flex gap-2 mt-3">
            {axis.map((char, index) => {
              return (
                <Input
                  leftText={char}
                  key={index}
                  value={coordinates["translate"][char as Axis]}
                  setter={(value) =>
                    updatePosition("translate", char as Axis, value)
                  }
                />
              );
            })}
            <button
              onClick={handleTranslate}
              className="px-2 py-1 border bg-purple rounded-md border-white"
            >
              <span className="text-sm">Apply</span>
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-gray100">Rotate</h4>
          <div className="flex gap-2 mt-3">
            {axis.map((char, index) => {
              return (
                <Input
                  leftText={char}
                  key={index}
                  value={coordinates["rotate"][char as Axis]}
                  setter={(value) =>
                    updatePosition("rotate", char as Axis, value)
                  }
                />
              );
            })}
            <button
              onClick={handleRotate}
              className="px-2 py-1 border bg-purple rounded-md border-white"
            >
              <span className="text-sm">Apply</span>
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-gray100">Scale</h4>
          <div className="flex gap-2 mt-3">
            {axis.map((char, index) => {
              return (
                <Input
                  leftText={char}
                  key={index}
                  value={coordinates["scale"][char as Axis]}
                  setter={(value) =>
                    updatePosition("scale", char as Axis, value)
                  }
                />
              );
            })}
            <button
              onClick={handleScale}
              className="px-2 py-1 border bg-purple rounded-md border-white"
            >
              <span className="text-sm">Apply</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
