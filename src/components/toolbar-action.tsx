import { cloneElement, useRef, type JSX } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function ToolbarAction({
  message,
  onClick,
  disabled,
  icon,
}: {
  message: string;
  onClick: () => void;
  disabled: boolean;
  icon: JSX.Element;
}) {
  const ref = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  return (
    <ActionTooltip message={message}>
      <button
        onMouseEnter={ref.current?.startAnimation}
        onMouseLeave={ref.current?.stopAnimation}
        onClick={onClick}
        disabled={disabled}
        className=" px-1 py-1 rounded-sm h-10 w-10 flex items-center justify-center text-tertiary hover:bg-secondary transition-[background-color,opacity] disabled:opacity-50"
      >
        {cloneElement(icon, { ref: ref })}
      </button>
    </ActionTooltip>
  );
}

function ActionTooltip({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={10}>
        <p>{message}</p>
      </TooltipContent>
    </Tooltip>
  );
}
