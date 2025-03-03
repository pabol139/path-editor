import Input from "../inputs/Input";

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
              leftText={char}
              key={index}
              value={coordinates[action][char as Axis]}
              setter={(value) => updatePosition(action, char as Axis, value)}
            />
          );
        })}
        <button
          onClick={handleTransform}
          className="px-2 py-1 border bg-purple rounded-md border-white"
        >
          <span className="text-sm">Apply</span>
        </button>
      </div>
    </div>
  );
}
