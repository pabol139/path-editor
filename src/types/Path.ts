import type { Point } from "./Point";

export type Command<T> = {
  id: string;
  letter: string;
  coordinates: T[];
  hovered: boolean;
  selected: boolean;
  points: Point[];
  prevPoint: { x: number; y: number };
};

export type ParsePath<T> = Command<T>[];

export type PathObject = {
  path: string;
  displayPath: string;
  commands: ParsePath<number>;
};

export type Stack = Array<{ error: boolean } & PathObject>;

export interface PathState {
  path: string;
  displayPath: string;
  commands: ParsePath<number>;
  undoStack: Stack;
  redoStack: Stack;
  error: boolean;
}

export type Action =
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
