import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function CommandCreate({
  handleCreateCommandWithFlag,
  handleCloseAutoFocus,
  open,
  children,
  ...props
}: {
  handleCreateCommandWithFlag: (letter: string) => void;
  handleCloseAutoFocus: (e: Event) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: any;
}) {
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 border-[#5a5a60]"
        align="center"
        onCloseAutoFocus={handleCloseAutoFocus}
        onPointerUp={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          {COMMANDS_INFO.map(({ letter, name }) => (
            <DropdownMenuItem
              key={letter}
              onClick={() => handleCreateCommandWithFlag(letter)}
            >
              <span className="border border-tertiary px-1 w-6 shrink-0 text-center rounded-sm">
                {letter}
              </span>
              {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default React.memo(CommandCreate);
