import React, { useCallback, useMemo, useRef } from "react";

import useCommandActions from "@/hooks/useCommandActions";
import CommandCreate from "./command-create";

function CommandCreateWrapper({
  children,
  ...props
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: any;
}) {
  const shouldPreventAutoFocus = useRef(false);
  const { handleCreateCommand } = useCommandActions();

  const handleCreateCommandWithFlag = useCallback(
    (letter: string) => {
      shouldPreventAutoFocus.current = true;
      handleCreateCommand("", letter);
    },
    [handleCreateCommand]
  );

  const handleCloseAutoFocus = useCallback((e: Event) => {
    if (shouldPreventAutoFocus.current) {
      e.preventDefault();
      shouldPreventAutoFocus.current = false;
    }
    // If shouldPreventAutoFocus is false, the default focus behavior will happen
  }, []);

  const memoizedChildren = useMemo(() => {
    return children;
  }, []);

  const memoizedProps = useMemo(() => {
    return props;
  }, [props]);

  return (
    <CommandCreate
      handleCreateCommandWithFlag={handleCreateCommandWithFlag}
      handleCloseAutoFocus={handleCloseAutoFocus}
      {...memoizedProps}
    >
      {memoizedChildren}
    </CommandCreate>
  );
}

export default CommandCreateWrapper;
