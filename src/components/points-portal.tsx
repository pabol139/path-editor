import { isRelativeCommand } from "@/utils/path";
import CommandActionsWrapper from "./commands/command-actions-wrapper";
import { createPortal } from "react-dom";
import type { ParsePath } from "@/types/Path";
import { useEffect, useState } from "react";

export default function PointsPortal({
  open,
  setOpen,
  commands,
  portalInfo,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  commands: ParsePath<number>;
  portalInfo: any;
}) {
  const command = commands.find((command) => command.id === portalInfo.id);
  if (!command || !command.selected) return;

  const isRelative = isRelativeCommand(command.letter);

  return (
    <>
      {createPortal(
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
            aria-hidden={true}
            style={{
              "--button-size": "15px",
              position: "absolute",
              left: `calc(${portalInfo.position.x}px - (var(--button-size) / 2))`,
              top: `calc(${portalInfo.position.y}px - (var(--button-size) / 2))`,
              height: "15px",
              width: "15px",
              pointerEvents: "none",
              zIndex: "1111",
              opacity: "0",
              visibility: "hidden",
            }}
          ></button>
        </CommandActionsWrapper>,
        document.body
      )}
    </>
  );
}
