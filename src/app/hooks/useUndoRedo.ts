import { UpdateCommandsType, usePathObject } from "@/context/PathContext";
import { ParsePath, PathObject } from "@/types/Path";
import { useState } from "react";

export default function useUndoRedo(
  pathObject: PathObject,
  updateCommands: UpdateCommandsType
) {
  const [undoStack, setUndoStack] = useState<PathObject[]>([]);
  const [redoStack, setRedoStack] = useState<PathObject[]>([]);

  const handleUndo = () => {
    const undoState = undoStack[undoStack.length - 1];
    updateCommands(undoState.commands, false);
    setUndoStack((prevUndoStack) => [
      ...prevUndoStack.slice(0, undoStack.length - 1),
    ]);
    setRedoStack((prevRedoStack) => [...prevRedoStack, pathObject]);
  };
  const handleRedo = () => {
    const redoState = redoStack[redoStack.length - 1];
    updateCommands(redoState.commands, false);

    setRedoStack((prevRedoStack) => [
      ...prevRedoStack.slice(0, redoStack.length - 1),
    ]);
    setUndoStack((prevUndoStack) => [...prevUndoStack, pathObject]);
  };

  const store = (externalPathObject?: PathObject) => {
    const finalObject = externalPathObject ? externalPathObject : pathObject;

    console.log(pathObject);
    setUndoStack((prevUndoStack) => [...prevUndoStack, finalObject]);
    setRedoStack([]);
  };

  return { undoStack, redoStack, handleRedo, handleUndo, store };
}
