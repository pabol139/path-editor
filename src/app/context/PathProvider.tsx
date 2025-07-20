"use client";
import { ParsePath, PathObject } from "@/types/Path";
import { parsePath, convertCommandsToPath, formatCommands } from "@/utils/path";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { PathProviderProps, DEFAULT_PATH, PathContext } from "./PathContext";

// --- Types ---
interface PathState {
  path: string;
  commands: ParsePath<number>;
  undoStack: Array<{ path: string; commands: ParsePath<number> }>;
  redoStack: Array<{ path: string; commands: ParsePath<number> }>;
  error: string | null;
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
          commands: newCommands,
          undoStack: [],
          redoStack: [],
          error: null,
        };
      } catch (e: any) {
        return {
          path: action.payload,
          commands: state.commands,
          undoStack: [],
          redoStack: [],
          error: e.message,
        };
      }
    }
    case "UPDATE_COMMANDS": {
      // save current for undo

      try {
        const { updater, shouldSave = true } = action.payload;

        const updatedCommands =
          typeof updater === "function" ? updater(state.commands) : updater;
        const formatted = formatCommands(updatedCommands, 2);
        const newPath = convertCommandsToPath(formatted);
        return {
          path: newPath,
          commands: formatted,
          undoStack: shouldSave
            ? [
                ...state.undoStack,
                { path: state.path, commands: state.commands },
              ]
            : [...state.undoStack],
          redoStack: shouldSave ? [] : [...state.redoStack],
          error: null,
        };
      } catch (e: any) {
        return {
          ...state,
          error: e.message,
        };
      }
    }
    case "UNDO": {
      const last = state.undoStack[state.undoStack.length - 1];
      if (!last) return state;
      return {
        path: last.path,
        commands: last.commands,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [
          ...state.redoStack,
          { path: state.path, commands: state.commands },
        ],
        error: null,
      };
    }

    case "REDO": {
      const last = state.redoStack[state.redoStack.length - 1];
      if (!last) return state;
      return {
        path: last.path,
        commands: last.commands,
        undoStack: [
          ...state.undoStack,
          { path: state.path, commands: state.commands },
        ],
        redoStack: state.redoStack.slice(0, -1),
        error: null,
      };
    }
    case "STORE": {
      const { newPathObject } = action.payload;

      return {
        path: state.path,
        commands: state.commands,
        undoStack: [
          ...state.undoStack,
          { path: newPathObject.path, commands: newPathObject.commands },
        ],
        redoStack: [],
        error: null,
      };
    }
  }
}

export function PathProvider({ children }: PathProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    path: DEFAULT_PATH,
    commands: parsePath(DEFAULT_PATH),
    undoStack: [],
    redoStack: [],
    error: null,
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

  return (
    <PathContext.Provider
      value={{
        pathObject: {
          path: state.path,
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
