import {
  onPointerDownCommand,
  onPointerEnterCommand,
  onPointerLeaveCommand,
} from "@/utils/path";
import { Point } from "./point";
import { Point as PointType } from "@/types/Point";
import { ParsePath, PathObject } from "@/types/Path";
import usePoints from "@/hooks/usePoints";
import { usePathObject } from "@/context/PathContext";

export default function Points({
  points,
  viewboxWidth,
  svgDimensionsWidth,
}: {
  points: PointType[];

  viewboxWidth: number;
  svgDimensionsWidth: number;
}) {
  const {
    pathObject,
    updateCommands,
    undoUtils: { store },
  } = usePathObject();

  const { handleMove, handleUp } = usePoints(
    points,
    pathObject,
    store,
    updateCommands
  );
  const { commands } = pathObject;

  return (
    <>
      {points.map((point) => {
        return (
          <Point
            key={point.id}
            point={point}
            radius={String((3.5 * viewboxWidth) / svgDimensionsWidth)}
            strokeWidth={String((13 * viewboxWidth) / svgDimensionsWidth)}
            handleMove={handleMove}
            handleEnter={() =>
              onPointerEnterCommand(commands, updateCommands, point.id_command)
            }
            handleLeave={() => onPointerLeaveCommand(commands, updateCommands)}
            handleDown={() =>
              onPointerDownCommand(commands, updateCommands, point.id_command)
            }
            handleUp={handleUp}
          ></Point>
        );
      })}
    </>
  );
}
