import React, { useRef, useState } from "react";
import { ArrowRightLeft, EllipsisVertical, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash } from "react-feather";

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
function CommandOptions({
  id,
  isFirst,
  isRelative,
  handleDelete,
  handleConvertToRelative,
  handleConvertToAbsolute,
  handleCreateCommand,
  handleDisabledCommand,
}: {
  id: string;
  isFirst: boolean;
  isRelative: boolean;
  handleDelete: (id: string) => void;
  handleConvertToRelative: (id: string) => void;
  handleConvertToAbsolute: (id: string) => void;
  handleCreateCommand: (id: string, letter: string) => void;
  handleDisabledCommand: (letter: string) => boolean;
}) {
  const shouldPreventAutoFocus = useRef(false);

  const handleCreateCommandWithFlag = (letter: string) => {
    shouldPreventAutoFocus.current = true;
    handleCreateCommand(id, letter);
  };

  const handleCloseAutoFocus = (e: Event) => {
    if (shouldPreventAutoFocus.current) {
      e.preventDefault();
      shouldPreventAutoFocus.current = false;
    }
    // If shouldPreventAutoFocus is false, the default focus behavior will happen
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus-visible:outline-[deeppink] focus-visible:outline focus-visible:rounded-sm !text-white hover:bg-gray-600 rounded-sm transition-colors">
          <EllipsisVertical
            size={16}
            className="shrink-0 min-w-4"
          ></EllipsisVertical>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 border-[#5a5a60]"
        align="end"
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator></DropdownMenuSeparator>
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
            <DropdownMenuItem onClick={() => handleConvertToAbsolute(id)}>
              <ArrowRightLeft></ArrowRightLeft>
              Set absolute
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleConvertToRelative(id)}>
              <ArrowRightLeft></ArrowRightLeft>
              Set relative
            </DropdownMenuItem>
          )}

          <DropdownMenuItem disabled={isFirst} onClick={() => handleDelete(id)}>
            <Trash></Trash>
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default React.memo(CommandOptions);
