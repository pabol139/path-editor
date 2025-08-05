"use client";

import { createContext, useContext } from "react";
import type { ParsePath, PathObject } from "@/types/Path";
import { PATH_LIST } from "@/constants/path-list";
export interface PathProviderProps {
  children: React.ReactNode;
}

export const DEFAULT_PATH = PATH_LIST[0];

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
