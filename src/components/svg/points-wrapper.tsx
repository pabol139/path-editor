import type { Point as PointType } from "@/types/Point";
import usePoints from "@/hooks/usePoints";
import { usePathObject } from "@/context/path-context";
import { useEffect, useRef, useState } from "react";
import PointsPortal from "./points-portal";
import type { Viewbox } from "@/types/Viewbox";
import Points from "./points";

export type PortalInfo = {
  id: string;
  isFirst: boolean;
  position: {
    x: number;
    y: number;
  };
};

export default function PointsWrapper({
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
      <Points
        points={points}
        commands={commands}
        updateCommands={updateCommands}
        pointWidth={pointWidth}
        pointStrokeWidth={pointStrokeWidth}
        setIsCircleDragging={setIsCircleDragging}
        setPortalInfo={setPortalInfo}
        setOpenPortal={setOpenPortal}
        handlePointerDown={handlePointerDown}
        activeCircle={activeCircle}
        handleMove={handleMove}
        handleUp={handleUp}
      ></Points>

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
