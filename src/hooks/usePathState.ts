import { DEFAULT_PATH } from "@/context/path-context";
import type { Action, ParsePath, PathObject, PathState } from "@/types/Path";
import {
  parsePath,
  convertCommandsToPath,
  formatCommands,
  cleanSelectedAndHoveredCommands,
  generatePoints,
} from "@/utils/path";
import {
  getInitialPath,
  savePathToStorage,
  updateStack,
} from "@/utils/path-state";
import { useCallback, useEffect, useReducer } from "react";

const getInitialCommands = () => {
  const newCommands = parsePath(getInitialPath());
  const commandsWithPoints = generatePoints(newCommands);

  return commandsWithPoints;
};

const INITIAL_STATE = {
  path: getInitialPath(),
  displayPath: getInitialPath(),
  commands: getInitialCommands(),
  undoStack: [],
  redoStack: [],
  error: false,
};

function reducer(state: PathState, action: Action) {
  switch (action.type) {
    case "SET_PATH": {
      try {
        const newCommands = parsePath(action.payload);
        const commandsWithPoints = generatePoints(newCommands);
        if (!action.payload.trim()) savePathToStorage(DEFAULT_PATH);
        else savePathToStorage(action.payload);

        return {
          path: action.payload,
          displayPath: action.payload,
          commands: commandsWithPoints,
          undoStack: updateStack([
            ...state.undoStack,
            {
              path: state.path,
              displayPath: state.displayPath,
              commands: cleanSelectedAndHoveredCommands(state.commands),
              error: state.error,
            },
          ]),
          redoStack: updateStack([]),
          error: false,
        };
      } catch (e: any) {
        return {
          ...state,
          displayPath: action.payload,
          undoStack: updateStack([
            ...state.undoStack,
            {
              path: state.path,
              displayPath: state.displayPath,
              commands: cleanSelectedAndHoveredCommands(state.commands),
              error: state.error,
            },
          ]),
          redoStack: updateStack([]),
          error: true,
        };
      }
    }
    case "UPDATE_COMMANDS": {
      try {
        const { updater, shouldSave = true } = action.payload;

        const rawCommands =
          typeof updater === "function" ? updater(state.commands) : updater;
        const rawCommandsWithPoints = generatePoints(rawCommands);
        const formatted = formatCommands(rawCommandsWithPoints, 2);
        const newPath = convertCommandsToPath(formatted);

        if (!newPath.trim()) savePathToStorage(DEFAULT_PATH);
        else shouldSave && savePathToStorage(newPath);

        return {
          path: newPath,
          displayPath: newPath,
          commands: formatted,
          undoStack: updateStack(
            shouldSave
              ? [
                  ...state.undoStack,
                  {
                    path: state.path,
                    displayPath: state.displayPath,
                    commands: cleanSelectedAndHoveredCommands(state.commands),
                    error: state.error,
                  },
                ]
              : [...state.undoStack]
          ),
          redoStack: updateStack(shouldSave ? [] : [...state.redoStack]),
          error: false,
        };
      } catch (e: any) {
        console.error(e);
        return {
          ...state,
          error: true,
        };
      }
    }
    case "UNDO": {
      const last = state.undoStack[state.undoStack.length - 1];
      if (!last) return state;

      savePathToStorage(last.path);

      return {
        ...last,
        undoStack: updateStack(state.undoStack.slice(0, -1)),
        redoStack: updateStack([
          ...state.redoStack,
          {
            path: state.path,
            displayPath: state.displayPath,
            commands: cleanSelectedAndHoveredCommands(state.commands),
            error: state.error,
          },
        ]),
      };
    }

    case "REDO": {
      const last = state.redoStack[state.redoStack.length - 1];
      if (!last) return state;
      savePathToStorage(last.path);

      return {
        ...last,
        undoStack: updateStack([
          ...state.undoStack,
          {
            path: state.path,
            displayPath: state.displayPath,
            commands: cleanSelectedAndHoveredCommands(state.commands),
            error: state.error,
          },
        ]),
        redoStack: updateStack(state.redoStack.slice(0, -1)),
      };
    }
    case "STORE": {
      const { newPathObject } = action.payload;

      savePathToStorage(state.path);

      return {
        ...state,
        undoStack: updateStack([
          ...state.undoStack,
          {
            path: newPathObject.path,
            displayPath: newPathObject.displayPath,
            commands: cleanSelectedAndHoveredCommands(newPathObject.commands),
            error: false,
          },
        ]),
        redoStack: updateStack([]),
      };
    }
  }
}

export default function usePathState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

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

  useEffect(() => {
    function handleKeydown(evt: KeyboardEvent) {
      evt.stopImmediatePropagation();
      if (
        evt.key.toLocaleLowerCase() === "z" &&
        (evt.ctrlKey || evt.metaKey) &&
        evt.shiftKey
      ) {
        evt.preventDefault();
        evt.stopPropagation();
        redo();
      } else if (
        evt.key.toLocaleLowerCase() === "z" &&
        (evt.ctrlKey || evt.metaKey)
      ) {
        evt.preventDefault();
        evt.stopPropagation();
        undo();
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [undo, redo]);

  return {
    pathObject: {
      path: state.path,
      displayPath: state.displayPath,
      commands: state.commands,
    },
    updatePath,
    updateCommands,
    error: state.error,
    undoUtils: {
      store,
      undoStack: state.undoStack,
      redoStack: state.redoStack,
      handleUndo: undo,
      handleRedo: redo,
    },
  };
}
