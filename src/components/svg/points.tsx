import { onPointerEnterCommand, onPointerLeaveCommand } from "@/utils/path";
import { Point } from "./point";
import type { Point as PointType } from "@/types/Point";
import usePoints from "@/hooks/usePoints";
import { usePathObject } from "@/context/path-context";
import { useEffect, useRef, useState } from "react";
import React from "react";
import PointsPortal from "./points-portal";
import type { Viewbox } from "@/types/Viewbox";

type PortalInfo = {
  id: string;
  isFirst: boolean;
  position: {
    x: number;
    y: number;
  };
};

export default function Points({
  viewbox,
  points,
  pointWidth,
  pointStrokeWidth,
  handlePointerDown,
}: {
  viewbox: Viewbox;
  pointWidth: string;
  pointStrokeWidth: string;
  points: PointType[];
  handlePointerDown: (id_command: string) => void;
}) {
  const {
    pathObject,
    updateCommands,
    undoUtils: { store },
    svgRef,
  } = usePathObject();

  const { handleMove, handleUp } = usePoints(
    points,
    pathObject,
    store,
    updateCommands
  );
  const [openPortal, setOpenPortal] = useState(false);
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>();
  const [isCircleDragging, setIsCircleDragging] = useState(false);
  const activeCircle = useRef<EventTarget & SVGCircleElement>(null);
  const { commands } = pathObject;

  useEffect(() => {
    return () => {
      setOpenPortal(false);
      setPortalInfo(undefined);
    };
  }, []);

  return (
    <>
      {points.map((point, key) => {
        const command = pathObject.commands.find(
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
                onPointerEnterCommand(
                  commands,
                  updateCommands,
                  point.id_command
                );
              }}
              handleLeave={(isDragging: boolean) => {
                onPointerLeaveCommand(commands, updateCommands);
                setIsCircleDragging(isDragging);
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

      {portalInfo && openPortal && !isCircleDragging && (
        <PointsPortal
          open={openPortal}
          setOpen={setOpenPortal}
          portalInfo={portalInfo}
          commands={pathObject.commands}
          activeCircle={activeCircle}
          svgRef={svgRef}
          viewbox={viewbox}
        ></PointsPortal>
      )}
    </>
  );
}
