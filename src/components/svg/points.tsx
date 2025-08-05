import React from "react";
import { isTouchDevice } from "@/utils/svg";
import { onPointerEnterCommand, onPointerLeaveCommand } from "@/utils/path";
import type { Point as PointType } from "@/types/Point";
import type { ParsePath } from "@/types/Path";
import type { UpdateCommandsType } from "@/context/path-context";
import type { Coordinates } from "@/hooks/usePoints";
import type { PortalInfo } from "./points-wrapper";
import { Point } from "./point";

function Points({
  points,
  commands,
  updateCommands,
  handleMove,
  handleUp,
  handlePointerDown,
  setIsCircleDragging,
  pointWidth,
  pointStrokeWidth,
  activeCircle,
  setPortalInfo,
  setOpenPortal,
}: {
  points: PointType[];
  commands: ParsePath<number>;
  updateCommands: UpdateCommandsType;
  handleMove: (values: Coordinates, updateState: boolean) => void;
  handleUp: (hasMoved: boolean) => void;
  handlePointerDown: (id_command: string) => void;
  setIsCircleDragging: React.Dispatch<React.SetStateAction<boolean>>;
  pointWidth: string;
  pointStrokeWidth: string;
  activeCircle: React.RefObject<(EventTarget & SVGCircleElement) | null>;
  setPortalInfo: React.Dispatch<
    React.SetStateAction<PortalInfo | null | undefined>
  >;
  setOpenPortal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      {points.map((point, key) => {
        const command = commands.find(
          (command) => command.id === point.id_command
        );
        if (!command) return;
        return (
          <React.Fragment key={point.id}>
            <Point
              point={point}
              radius={pointWidth}
              strokeWidth={pointStrokeWidth}
              handleMove={(
                values: { id: string; x: number; y: number },
                updateState: boolean
              ) => {
                handleMove(values, updateState);
              }}
              handleEnter={() => {
                if (isTouchDevice()) {
                  return;
                }
                onPointerEnterCommand(
                  commands,
                  updateCommands,
                  point.id_command
                );
              }}
              handleLeave={() => {
                onPointerLeaveCommand(commands, updateCommands);
              }}
              handleDown={(isDragging: boolean) => {
                handlePointerDown(point.id_command);
                setIsCircleDragging(isDragging);
              }}
              handleUp={(hasMoved: boolean, isDragging: boolean) => {
                handleUp(hasMoved);
                setIsCircleDragging(isDragging);
              }}
              handleClick={(
                e:
                  | React.MouseEvent<SVGCircleElement, MouseEvent>
                  | React.TouchEvent<SVGCircleElement>
              ) => {
                activeCircle.current = e.currentTarget;
                const rect = e.currentTarget.getBoundingClientRect();
                setPortalInfo({
                  id: command.id,
                  isFirst: key === 0,
                  position: {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                  },
                });
                setOpenPortal(true);
                e.preventDefault();
              }}
            ></Point>
          </React.Fragment>
        );
      })}
    </>
  );
}

export default React.memo(Points);
