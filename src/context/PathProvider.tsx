"use client";
import type { ParsePath, PathObject } from "@/types/Path";
import { parsePath, convertCommandsToPath, formatCommands } from "@/utils/path";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  type PathProviderProps,
  DEFAULT_PATH,
  PathContext,
} from "./PathContext";

// --- Types ---
interface PathState {
  path: string;
  displayPath: string;
  commands: ParsePath<number>;
  undoStack: Array<{ error: boolean } & PathObject>;
  redoStack: Array<{ error: boolean } & PathObject>;
  error: boolean;
}

type Action =
  | { type: "SET_PATH"; payload: string }
  | {
      type: "UPDATE_COMMANDS";
      payload: {
        updater:
          | ParsePath<number>
          | ((commands: ParsePath<number>) => ParsePath<number>);
        shouldSave?: boolean;
      };
    }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "STORE"; payload: { newPathObject: PathObject } };

function reducer(state: PathState, action: Action) {
  switch (action.type) {
    case "SET_PATH": {
      try {
        const newCommands = parsePath(action.payload);
        return {
          path: action.payload,
          displayPath: action.payload,
          commands: newCommands,
          undoStack: [
            ...state.undoStack,
            {
              path: state.path,
              displayPath: state.displayPath,
              commands: state.commands,
              error: state.error,
            },
          ],
          redoStack: [],
          error: false,
        };
      } catch (e: any) {
        return {
          ...state,
          displayPath: action.payload,
          undoStack: [
            ...state.undoStack,
            {
              path: state.path,
              displayPath: state.displayPath,
              commands: state.commands,
              error: state.error,
            },
          ],
          redoStack: [],
          error: true,
        };
      }
    }
    case "UPDATE_COMMANDS": {
      try {
        const { updater, shouldSave = true } = action.payload;

        const updatedCommands =
          typeof updater === "function" ? updater(state.commands) : updater;
        const formatted = formatCommands(updatedCommands, 2);
        const newPath = convertCommandsToPath(formatted);
        return {
          path: newPath,
          displayPath: newPath,
          commands: formatted,
          undoStack: shouldSave
            ? [
                ...state.undoStack,
                {
                  path: state.path,
                  displayPath: state.displayPath,
                  commands: state.commands,
                  error: state.error,
                },
              ]
            : [...state.undoStack],
          redoStack: shouldSave ? [] : [...state.redoStack],
          error: false,
        };
      } catch (e: any) {
        return {
          ...state,
          error: true,
        };
      }
    }
    case "UNDO": {
      const last = state.undoStack[state.undoStack.length - 1];
      if (!last) return state;
      return {
        ...last,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [
          ...state.redoStack,
          {
            path: state.path,
            displayPath: state.displayPath,
            commands: state.commands,
            error: state.error,
          },
        ],
      };
    }

    case "REDO": {
      const last = state.redoStack[state.redoStack.length - 1];
      if (!last) return state;
      return {
        ...last,
        undoStack: [
          ...state.undoStack,
          {
            path: state.path,
            displayPath: state.displayPath,
            commands: state.commands,
            error: state.error,
          },
        ],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case "STORE": {
      const { newPathObject } = action.payload;

      return {
        ...state,
        undoStack: [
          ...state.undoStack,
          {
            path: newPathObject.path,
            displayPath: newPathObject.displayPath,
            commands: newPathObject.commands,
            error: false,
          },
        ],
        redoStack: [],
      };
    }
  }
}

export function PathProvider({ children }: PathProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    path: DEFAULT_PATH,
    displayPath: DEFAULT_PATH,
    commands: parsePath(DEFAULT_PATH),
    undoStack: [],
    redoStack: [],
    error: false,
  });

  const updatePath = useCallback((path: string) => {
    dispatch({ type: "SET_PATH", payload: path });
  }, []);

  const updateCommands = useCallback(
    (
      updater:
        | ParsePath<number>
        | ((commands: ParsePath<number>) => ParsePath<number>),
      shouldSave?: boolean
    ) => {
      dispatch({ type: "UPDATE_COMMANDS", payload: { updater, shouldSave } });
    },
    []
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const store = useCallback(
    (newPathObject: PathObject) =>
      dispatch({ type: "STORE", payload: { newPathObject } }),
    []
  );

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    function handleKeydown(evt: KeyboardEvent) {
      evt.stopImmediatePropagation();
      if (
        evt.key.toLocaleLowerCase() === "z" &&
        (evt.ctrlKey || evt.metaKey) &&
        evt.shiftKey
      ) {
        redo();
      } else if (
        evt.key.toLocaleLowerCase() === "z" &&
        (evt.ctrlKey || evt.metaKey)
      ) {
        undo();
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [undo, redo]);

  return (
    <PathContext.Provider
      value={{
        pathObject: {
          path: state.path,
          displayPath: state.displayPath,
          commands: state.commands,
        },
        updatePath,
        updateCommands,
        error: state.error,
        svgRef,
        undoUtils: {
          store,
          undoStack: state.undoStack,
          redoStack: state.redoStack,
          handleUndo: undo,
          handleRedo: redo,
        },
      }}
    >
      {children}
    </PathContext.Provider>
  );
}
