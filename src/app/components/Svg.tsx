import { comma } from "postcss/lib/list";
import { usePathObject } from "../context/PathContext";
import { Viewbox } from "../types/Viewbox";
import { updatePoints } from "../utils/pathUtils";
import { Circle } from "./Circle";

type Coordinates = {
  id: string;
  x: number;
  y: number;
};

export default function Svg({ viewbox }: { viewbox: Viewbox }) {
  const { pathObject, updateCommands } = usePathObject();
  const circles = updatePoints(pathObject.commands);

  const handleMove = (values: Coordinates) => {
    const newCommands = [...pathObject.commands].map((command) => {
      if (command.id === values.id) {
        if (command.letter === "H") {
          command.coordinates[0] = values.x;
          return command;
        }
        if (command.letter === "V") {
          command.coordinates[0] = values.y;
          return command;
        }

        command.coordinates[0] = values.x;
        command.coordinates[1] = values.y;
      }
      return command;
    });

    console.log(pathObject.commands);
    console.log(newCommands);
    updateCommands(newCommands);
  };

  console.log(pathObject.commands);
  console.log(circles);

  //TODO: Add commands to tha path state, so they work together

  //   useEffect(() => {
  //     setPositions((prevPositions) =>
  //       circles.map((circle, index) => ({
  //         id: prevPositions[index].id
  //           ? prevPositions[index].id
  //           : crypto.randomUUID(),
  //         ...circle,
  //       }))
  //     );
  //   }, [path]);

  return (
    <svg
      className="w-[calc(100%-var(--aside-width))] h-full"
      viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
    >
      <path
        d={pathObject.path}
        fill="#ffffff40"
        stroke="#fff"
        strokeWidth={1}
      ></path>
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          id={circle.id}
          radius={circle.radius}
          cx={circle.cx}
          cy={circle.cy}
          fill={circle.fill}
          handleMove={handleMove}
        ></Circle>
      ))}
    </svg>
  );
}
