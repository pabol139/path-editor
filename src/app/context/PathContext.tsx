"use client";

import { createContext, useContext, useState } from "react";
import { PathObject, ParsePath } from "../types/Path";
import {
  mergeCommands,
  convertPathToString,
  parsePath,
} from "../utils/pathUtils";
interface PathProviderProps {
  children: React.ReactNode;
}
const DEFAULT_PATH = "M 200 500 H 500 L 500 220 L 200 220 Z";

type PathContextType = {
  pathObject: PathObject;
  updatePath: (newPath: string) => void;
  updateCommands: (newValues: any) => void;
};

export const PathContext = createContext<PathContextType | undefined>(
  undefined
);

export const SetPathContext = createContext<
  React.Dispatch<React.SetStateAction<PathObject>>
>(() => {});

export function PathProvider({ children }: PathProviderProps) {
  const [pathObject, setPathObject] = useState({
    path: DEFAULT_PATH,
    commands: parsePath(DEFAULT_PATH),
  });

  function updatePath(path: string) {
    setPathObject((prevObject) => ({
      path: path,
      commands: parsePath(path),
    }));
  }

  function updateCommands(commands: ParsePath<number>) {
    setPathObject((prevObject) => ({
      path: convertPathToString(mergeCommands(prevObject.commands, commands)),
      commands: mergeCommands(prevObject.commands, commands),
    }));
  }

  return (
    <PathContext.Provider value={{ pathObject, updatePath, updateCommands }}>
      {children}
    </PathContext.Provider>
  );
}

export function usePathObject() {
  const context = useContext(PathContext);
  if (!context) throw new Error("Context must be provided");

  return context;
}

export function useSetPath() {
  return useContext(SetPathContext);
}
