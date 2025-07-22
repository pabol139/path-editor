import React, { useCallback, useMemo, useRef, useState } from "react";

import useCommandActions from "@/hooks/useCommandActions";
import CommandActions from "./command-actions";

function CommandActionsWrapper({
  id,
  isFirst,
  isRelative,
  commandLetter,
  children,
  ...props
}: {
  id: string;
  isFirst: boolean;
  isRelative: boolean;
  commandLetter: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: any;
}) {
  const shouldPreventAutoFocus = useRef(false);
  const {
    handleConvertToAbsolute,
    handleConvertToRelative,
    handleCreateCommand,
    handleDelete,
    handleDisabledCommand,
  } = useCommandActions();

  const handleCreateCommandWithFlag = useCallback(
    (letter: string) => {
      shouldPreventAutoFocus.current = true;
      handleCreateCommand(id, letter);
    },
    [id, handleCreateCommand]
  );

  const handleCloseAutoFocus = useCallback((e: Event) => {
    if (shouldPreventAutoFocus.current) {
      e.preventDefault();
      shouldPreventAutoFocus.current = false;
    }
    // If shouldPreventAutoFocus is false, the default focus behavior will happen
  }, []);

  const handleDisabledCommandWithLetter = useCallback(
    (actionLetter: string) => {
      return handleDisabledCommand(commandLetter, actionLetter);
    },
    [commandLetter, handleDisabledCommand]
  );

  const handleConvertToAbsoluteWithId = useCallback(() => {
    handleConvertToAbsolute(id);
  }, [id, handleConvertToAbsolute]);

  const handleConvertToRelativeWithId = useCallback(() => {
    handleConvertToRelative(id);
  }, [id, handleConvertToRelative]);

  const handleDeleteWithId = useCallback(() => {
    handleDelete(id);
  }, [id, handleDelete]);

  const memoizedChildren = useMemo(() => {
    return children;
  }, [id]);

  const memoizedProps = useMemo(() => {
    return props;
  }, [props]);

  return (
    <CommandActions
      isRelative={isRelative}
      isFirst={isFirst}
      handleCreateCommandWithFlag={handleCreateCommandWithFlag}
      handleCloseAutoFocus={handleCloseAutoFocus}
      handleConvertToAbsolute={handleConvertToAbsoluteWithId}
      handleConvertToRelative={handleConvertToRelativeWithId}
      handleDelete={handleDeleteWithId}
      handleDisabledCommand={handleDisabledCommandWithLetter}
      {...memoizedProps}
    >
      {memoizedChildren}
    </CommandActions>
  );
}

export default CommandActionsWrapper;
