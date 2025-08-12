import Input from "../inputs/input";
import AnimatedButton from "../animated-button";
import { Check } from "lucide-react";

type Axis = "x" | "y";
type Action = "translate" | "rotate" | "scale";

type Coordinates = {
  translate: AxisValues;
  rotate: AxisValues;
  scale: AxisValues;
};
type AxisValues = {
  x: string;
  y: string;
};
export function TransformRow({
  title,
  coordinates,
  action,
  updatePosition,
  handleTransform,
}: {
  title: string;
  action: Action;
  coordinates: Coordinates;
  updatePosition: (action: Action, axis: Axis, value: string) => void;
  handleTransform: () => void;
}) {
  const axis = Object.keys(coordinates[action]);

  return (
    <div>
      <h4 className="text-gray100 first-letter:uppercase">{title}</h4>
      <div className="flex gap-2 mt-3">
        {axis.map((char, index) => {
          return (
            <Input
              data-testid={char + action}
              id={char + action}
              leftText={char}
              key={index}
              value={coordinates[action][char as Axis]}
              setter={(value) => updatePosition(action, char as Axis, value)}
              onBlur={() => {
                const parsedValue =
                  parseFloat(coordinates[action][char as Axis]) || 0;
                updatePosition(action, char as Axis, String(parsedValue));
              }}
            />
          );
        })}

        <AnimatedButton
          data-testid={"button-" + action}
          onClick={handleTransform}
          className="w-fit"
          aria-label={`Apply ${action}`}
        >
          <Check size={16}></Check>
        </AnimatedButton>
      </div>
    </div>
  );
}
