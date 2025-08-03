import React from "react";
import { ArrowRightLeft, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash } from "lucide-react";

const COMMANDS_INFO = [
  {
    letter: "M",
    name: "Move to",
  },
  {
    letter: "L",
    name: "Line to",
  },
  {
    letter: "V",
    name: "Vertical line to",
  },
  {
    letter: "H",
    name: "Horizontal line to",
  },
  {
    letter: "C",
    name: "Curve to",
  },
  {
    letter: "S",
    name: "Smooth curve to",
  },
  {
    letter: "Q",
    name: "Quadratic curve to",
  },
  {
    letter: "T",
    name: "Smooth quadratic curve to",
  },
  {
    letter: "A",
    name: "Arc to",
  },
  {
    letter: "Z",
    name: "Close path",
  },
];

function CommandActions({
  isRelative,
  isFirst,
  handleCreateCommandWithFlag,
  handleCloseAutoFocus,
  handleConvertToAbsolute,
  handleConvertToRelative,
  handleDelete,
  handleDisabledCommand,
  open,
  children,
  ...props
}: {
  isRelative: boolean;
  isFirst: boolean;
  handleCreateCommandWithFlag: (letter: string) => void;
  handleCloseAutoFocus: (e: Event) => void;
  handleConvertToAbsolute: () => void;
  handleConvertToRelative: () => void;
  handleDelete: () => void;
  handleDisabledCommand: (actionLetter: string) => boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: any;
}) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 border-[#5a5a60]"
        align="end"
        onCloseAutoFocus={handleCloseAutoFocus}
        // onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      >
        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Plus></Plus>
              Insert after
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="border-[#5a5a60]">
                {COMMANDS_INFO.map(({ letter, name }) => (
                  <DropdownMenuItem
                    key={letter}
                    onClick={() => handleCreateCommandWithFlag(letter)}
                    disabled={handleDisabledCommand(letter)}
                  >
                    <span className="border border-tertiary px-1 w-6 shrink-0 text-center rounded-sm">
                      {letter}
                    </span>
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {isRelative ? (
            <DropdownMenuItem onClick={handleConvertToAbsolute}>
              <ArrowRightLeft></ArrowRightLeft>
              Set absolute
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleConvertToRelative}>
              <ArrowRightLeft></ArrowRightLeft>
              Set relative
            </DropdownMenuItem>
          )}

          <DropdownMenuItem disabled={isFirst} onClick={handleDelete}>
            <Trash></Trash>
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default React.memo(CommandActions);
