"use client";

import { createContext, useContext } from "react";
import type { ParsePath, PathObject } from "@/types/Path";
export interface PathProviderProps {
  children: React.ReactNode;
}

export const DEFAULT_PATH =
  "M 36 62.8223232 C 40.50 62.82 44.25 66 48 66 C 57 66 66 42 66 29.34 A 14.73 14.73 0 0 0 51 15 C 44.34 15 39 19.32 36 20.97 C 35.64 13.02 36.03 9 35.97 9.06 C 77.87 -10.66 38.03 -7.19 36 9 L 39.06 -8.55 H 35.04 C 34.05 -6.57 32.40 15.78 35.13 20.97 C 33 19.32 27.66 15 21 15 A 14.70 14.70 0 0 0 6 29.34 C 6 42 15 66 24 66 C 27.75 66 31.50 62.82 36 62.82 Z";

export type UpdateCommandsType = (
  commands:
    | ParsePath<number>
    | ((currentCommands: ParsePath<number>) => ParsePath<number>),
  shouldSave?: boolean
) => void;

type PathContextType = {
  pathObject: PathObject;
  updatePath: (newPath: string) => void;
  updateCommands: (
    commands:
      | ParsePath<number>
      | ((currentCommands: ParsePath<number>) => ParsePath<number>),
    shouldSave?: boolean
  ) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  error: boolean;
  undoUtils: {
    store: (newPathObject: PathObject) => void;
    undoStack: PathObject[];
    redoStack: PathObject[];
    handleRedo: () => void;
    handleUndo: () => void;
  };
};

export const PathContext = createContext<PathContextType | undefined>(
  undefined
);

export function usePathObject() {
  const context = useContext(PathContext);
  if (!context) throw new Error("Context must be provided");

  return context;
}
