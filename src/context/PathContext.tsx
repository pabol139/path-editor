"use client";

import { createContext, useContext } from "react";
import type { ParsePath, PathObject } from "@/types/Path";
export interface PathProviderProps {
  children: React.ReactNode;
}

export const DEFAULT_PATH =
  "M 12 20.94 c 1.50 0 2.75 1.06 4 1.06 c 3 0 6 -8.00 6 -12.22 A 4.91 4.91 0 0 0 17 5 c -2.22 0 -4.00 1.44 -5.00 1.99 C 11.88 4.34 12.01 3 11.99 3.02 C 25.19 -4.79 13.14 -5.68 12 3 L 13.02 -2.85 H 11.68 C 11.35 -2.19 10.80 5.26 11.71 6.99 C 11 6.44 9.22 5 7 5 a 4.90 4.90 0 0 0 -5.00 4.78 C 2 14 5 22 8 22 c 1.25 0 2.50 -1.06 4 -1.06 Z";

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

export const SetPathContext = createContext<
  React.Dispatch<React.SetStateAction<PathObject>>
>(() => {});

export function usePathObject() {
  const context = useContext(PathContext);
  if (!context) throw new Error("Context must be provided");

  return context;
}

export function useSetPath() {
  return useContext(SetPathContext);
}
