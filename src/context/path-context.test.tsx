import React from "react";
import { renderHook, act } from "@testing-library/react";
import { usePathObject } from "./path-context";
import { PathProvider } from "./path-provider";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <PathProvider>{children}</PathProvider>;
};

const createCommandObject = (
  letter: string,
  coordinates: number[],
  overrides = {}
) => ({
  id: expect.any(String),
  letter,
  coordinates,
  hovered: false,
  selected: false,
  ...overrides,
});

describe("PathContext", () => {
  test("should initialize with default values", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    expect(result.current.pathObject.path).toBeDefined();
    expect(result.current.pathObject.displayPath).toBeDefined();
    expect(result.current.pathObject.commands).toBeDefined();
    expect(result.current.error).toBe(false);
    expect(result.current.undoUtils.undoStack).toHaveLength(0);
    expect(result.current.undoUtils.redoStack).toHaveLength(0);
  });

  test("should update path when valid path is provided", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    act(() => {
      result.current.updatePath("M 10 20 L 30 40");
    });

    expect(result.current.pathObject.path).toBe("M 10 20 L 30 40");
    expect(result.current.pathObject.displayPath).toBe("M 10 20 L 30 40");
    expect(result.current.error).toBe(false);
    expect(result.current.undoUtils.undoStack).toHaveLength(1);
    expect(result.current.undoUtils.redoStack).toHaveLength(0);
  });

  test("should preserve valid path when invalid path is entered", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    // First set a valid path
    act(() => {
      result.current.updatePath("M 10 20");
    });

    const validPath = result.current.pathObject.path;

    // Then try invalid path
    act(() => {
      result.current.updatePath("INVALID PATH");
    });

    expect(result.current.pathObject.path).toBe(validPath);
    expect(result.current.pathObject.displayPath).toBe("INVALID PATH");
    expect(result.current.error).toBe(true);
    expect(result.current.undoUtils.undoStack).toHaveLength(2);
    expect(result.current.undoUtils.redoStack).toHaveLength(0);
  });

  test("should handle undo functionality correctly", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    const originalPath = result.current.pathObject.path;
    const originalDisplayPath = result.current.pathObject.displayPath;
    const originalError = result.current.error;

    act(() => {
      result.current.updatePath("M 10 20");
    });

    expect(result.current.pathObject.path).toBe("M 10 20");
    expect(result.current.pathObject.displayPath).toBe("M 10 20");
    expect(result.current.error).toBe(false);
    expect(result.current.undoUtils.undoStack).toHaveLength(1);
    expect(result.current.undoUtils.redoStack).toHaveLength(0);

    act(() => {
      result.current.undoUtils.handleUndo();
    });

    expect(result.current.pathObject.path).toBe(originalPath);
    expect(result.current.pathObject.displayPath).toBe(originalDisplayPath);
    expect(result.current.error).toBe(originalError);
    expect(result.current.undoUtils.undoStack).toHaveLength(0);
    expect(result.current.undoUtils.redoStack).toHaveLength(1);
  });

  test("should handle redo functionality correctly", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    act(() => {
      result.current.updatePath("M 10 20");
    });

    act(() => {
      result.current.undoUtils.handleUndo();
    });
    expect(result.current.undoUtils.redoStack).toHaveLength(1);

    act(() => {
      result.current.undoUtils.handleRedo();
    });

    expect(result.current.pathObject.path).toBe("M 10 20");
    expect(result.current.pathObject.displayPath).toBe("M 10 20");
    expect(result.current.error).toBe(false);
    expect(result.current.undoUtils.undoStack).toHaveLength(1);
    expect(result.current.undoUtils.redoStack).toHaveLength(0);
  });

  test("should not undo/redo when stacks are empty", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    const initialPath = result.current.pathObject.path;

    act(() => {
      result.current.undoUtils.handleUndo();
    });

    expect(result.current.pathObject.path).toBe(initialPath);

    act(() => {
      result.current.undoUtils.handleRedo();
    });

    expect(result.current.pathObject.path).toBe(initialPath);
  });

  test("should clear redo stack when new path is set", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    // Make two changes
    act(() => {
      result.current.updatePath("M 10 20");
    });

    act(() => {
      result.current.updatePath("M 30 40");
    });

    // Undo once to populate redo stack
    act(() => {
      result.current.undoUtils.handleUndo();
    });

    expect(result.current.undoUtils.redoStack).toHaveLength(1);

    // Make a new change - should clear redo stack
    act(() => {
      result.current.updatePath("M 50 60");
    });

    expect(result.current.undoUtils.redoStack).toHaveLength(0);
  });

  test("should clear redo stack when new commands are set", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    // Make two changes
    act(() => {
      result.current.updateCommands([createCommandObject("m", [10, 10])]);
    });

    act(() => {
      result.current.updateCommands([createCommandObject("m", [10, 10])]);
    });

    // Undo once to populate redo stack
    act(() => {
      result.current.undoUtils.handleUndo();
    });

    expect(result.current.undoUtils.redoStack).toHaveLength(1);

    // Make a new change - should clear redo stack
    act(() => {
      result.current.updateCommands([createCommandObject("m", [10, 10])]);
    });

    expect(result.current.undoUtils.redoStack).toHaveLength(0);
  });

  test("should not add to undo stack when new commands are set", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    act(() => {
      result.current.updateCommands(
        [createCommandObject("m", [10, 10])],
        false
      );
    });

    expect(result.current.undoUtils.undoStack).toHaveLength(0);

    act(() => {
      result.current.updateCommands([createCommandObject("m", [10, 10])]);
    });

    expect(result.current.undoUtils.undoStack).toHaveLength(1);
  });

  test("should add to undo stack on store", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    const prevPathObject = {
      path: "M 10 10",
      displayPath: "M 10 10",
      commands: [createCommandObject("m", [10, 10])],
    };

    act(() => {
      result.current.undoUtils.store(prevPathObject);
    });

    expect(result.current.undoUtils.undoStack).toHaveLength(1);
  });

  test("should limit undo stack with parsePath", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    // Perform 35 command updates
    for (let i = 1; i <= 35; i++) {
      act(() => {
        result.current.updatePath(`M ${i * 10} ${i * 10}`);
      });
    }

    // Should only keep 30 actions in undo stack
    expect(result.current.undoUtils.undoStack).toHaveLength(30);
  });

  test("should limit undo stack with updateCommands", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    // Perform 35 command updates
    for (let i = 1; i <= 35; i++) {
      act(() => {
        result.current.updateCommands([
          createCommandObject("M", [i * 10, i * 10]),
        ]);
      });
    }

    // Should only keep 30 actions in undo stack
    expect(result.current.undoUtils.undoStack).toHaveLength(30);
  });

  test("should limit undo stack with store operations", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    // Perform 35 store operations
    for (let i = 1; i <= 35; i++) {
      const pathObject = {
        path: `M ${i * 10} ${i * 10}`,
        displayPath: `M ${i * 10} ${i * 10}`,
        commands: [createCommandObject("M", [i * 10, i * 10])],
      };

      act(() => {
        result.current.undoUtils.store(pathObject);
      });
    }

    // Should only keep 30 actions in undo stack
    expect(result.current.undoUtils.undoStack).toHaveLength(30);
  });

  test("should limit redo stack to 30 actions", () => {
    const { result } = renderHook(() => usePathObject(), { wrapper });

    // Create 35 changes
    for (let i = 1; i <= 35; i++) {
      act(() => {
        result.current.updatePath(`M ${i * 10} ${i * 10}`);
      });
    }

    // Undo all 30 available actions (limited by stack size)
    for (let i = 0; i < 30; i++) {
      act(() => {
        result.current.undoUtils.handleUndo();
      });
    }

    // Redo stack should be limited to 30
    expect(result.current.undoUtils.redoStack).toHaveLength(30);

    // Should be at the final path
    expect(result.current.pathObject.path).toBe("M 50 50");
  });
});
