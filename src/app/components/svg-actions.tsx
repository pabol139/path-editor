import { usePathObject } from "@/context/PathContext";
import useUndoRedo from "@/hooks/useUndoRedo";
import { Redo, Undo } from "lucide-react";

export default function SvgActions() {
  const {
    undoUtils: { undoStack, redoStack, handleUndo, handleRedo },
  } = usePathObject();

  const undoStackIsEmpty = undoStack.length <= 0;
  const redoStackIsEmpty = redoStack.length <= 0;
  return (
    <div className="absolute right-8 bottom-8 flex gap-2">
      <button
        onClick={handleUndo}
        disabled={undoStackIsEmpty}
        className="bg-secondary px-1 py-1 rounded-sm h-10 text-tertiary border border-tertiary disabled:opacity-70"
      >
        <Undo></Undo>
      </button>
      <button
        onClick={handleRedo}
        disabled={redoStackIsEmpty}
        className="bg-secondary px-1 py-1 rounded-sm h-10 text-tertiary border border-tertiary disabled:opacity-70"
      >
        <Redo></Redo>
      </button>
    </div>
  );
}
