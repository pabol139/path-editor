import { isRelativeCommand } from "@/utils/path";
import CommandActionsWrapper from "../commands/command-actions-wrapper";
import { createPortal } from "react-dom";
import type { ParsePath } from "@/types/Path";
import { useLayoutEffect, useState, type CSSProperties } from "react";
import { isTouchDevice, svgToScreen } from "@/utils/svg";
import { Ellipsis } from "lucide-react";
import type { Viewbox } from "@/types/Viewbox";
import { cn } from "@/lib/utils";

export default function PointsPortal({
  open,
  setOpen,
  commands,
  portalInfo,
  activeCircle,
  svgRef,
  viewbox,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  commands: ParsePath<number>;
  portalInfo: any;
  activeCircle: React.RefObject<(EventTarget & SVGCircleElement) | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  viewbox: Viewbox;
}) {
  const [showPortal, setShowPortal] = useState(false);
  const [position, setPosition] = useState(() => {
    const svgX = activeCircle.current?.cx?.baseVal?.value ?? 0;
    const svgY = activeCircle.current?.cy?.baseVal?.value ?? 0;
    if (svgRef.current) return svgToScreen(svgRef.current, svgX, svgY);
    else
      return {
        x: svgX,
        y: svgY,
      };
  });

  useLayoutEffect(() => {
    if (activeCircle.current && svgRef.current) {
      const svgX = activeCircle.current.cx.baseVal.value;
      const svgY = activeCircle.current.cy.baseVal.value;
      const newPosition = svgToScreen(svgRef.current, svgX, svgY);
      setPosition(newPosition);
    }
  }, [open, portalInfo, viewbox]);

  const command = commands.find((command) => command.id === portalInfo.id);
  if (!command || !command.selected) return;

  const isRelative = isRelativeCommand(command.letter);
  const extraOffset = isTouchDevice() ? 30 : 0;
  const positionStyle = {
    "--button-size": isTouchDevice() ? "2.25rem" : "1rem",
    left: `calc(${position.x + extraOffset}px - (var(--button-size) / 2))`,
    top: `calc(${position.y + extraOffset}px - (var(--button-size) / 2))`,
  } as CSSProperties;

  return createPortal(
    <>
      <button
        onClick={() => setShowPortal(true)}
        aria-hidden={!isTouchDevice()}
        style={positionStyle}
        className={cn(
          "pointer-events-none border border-gray250 w-[var(--button-size)] shadow-md h-[var(--button-size)] opacity-0 invisible absolute z-10 bg-secondary text-tertiary flex items-center justify-center rounded-md",
          isTouchDevice() && "pointer-events-auto opacity-100 visible"
        )}
      >
        <Ellipsis></Ellipsis>
      </button>
      {(showPortal || !isTouchDevice()) && (
        <CommandActionsWrapper
          id={command.id}
          isFirst={portalInfo.isFirst}
          isRelative={isRelative}
          commandLetter={command.letter}
          defaultOpen={true}
          open={open}
          onOpenChange={setOpen}
        >
          <button
            aria-hidden={!isTouchDevice()}
            style={positionStyle}
            className={cn(
              "pointer-events-none w-[var(--button-size)] h-[var(--button-size)] opacity-0 invisible absolute",
              isTouchDevice() && "pointer-events-auto opacity-100 visible"
            )}
          ></button>
        </CommandActionsWrapper>
      )}
    </>,
    document.getElementById("root") ?? document.body
  );
}
