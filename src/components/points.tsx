import {
  onPointerDownCommand,
  onPointerEnterCommand,
  onPointerLeaveCommand,
} from "@/utils/path";
import { Point } from "./point";
import type { Point as PointType } from "@/types/Point";
import usePoints from "@/hooks/usePoints";
import { usePathObject } from "@/context/PathContext";
import { useEffect, useState } from "react";
import React from "react";
import PointsPortal from "./points-portal";

type PortalInfo = {
  id: string;
  isFirst: boolean;
  position: {
    x: number;
    y: number;
  };
};

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
  const [openPortal, setOpenPortal] = useState(false);
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>();
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
              radius={String((3.5 * viewboxWidth) / svgDimensionsWidth)}
              strokeWidth={String((13 * viewboxWidth) / svgDimensionsWidth)}
              handleMove={handleMove}
              handleEnter={() =>
                onPointerEnterCommand(
                  commands,
                  updateCommands,
                  point.id_command
                )
              }
              handleLeave={() =>
                onPointerLeaveCommand(commands, updateCommands)
              }
              handleDown={() =>
                onPointerDownCommand(commands, updateCommands, point.id_command)
              }
              handleUp={handleUp}
              handleClick={(
                e: React.MouseEvent<SVGCircleElement, MouseEvent>
              ) => {
                e.preventDefault();
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
              }}
            ></Point>
          </React.Fragment>
        );
      })}

      {portalInfo && openPortal && (
        <PointsPortal
          open={openPortal}
          setOpen={setOpenPortal}
          portalInfo={portalInfo}
          commands={pathObject.commands}
        ></PointsPortal>
      )}
    </>
  );
}
