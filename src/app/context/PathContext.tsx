"use client";

import { createContext, useContext, useState } from "react";
import { PathObject, ParsePath } from "@/types/Path";
import { convertPathToString, parsePath } from "@/utils/pathUtils";
interface PathProviderProps {
  children: React.ReactNode;
}
const DEFAULT_PATH = "M 200 500 H 500 L 500 200 L 200 200 Z";

type PathContextType = {
  pathObject: PathObject;
  updatePath: (newPath: string) => void;
  updateCommands: (newValues: any) => void;
  error: string | null;
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
  const [error, setError] = useState(null);

  function updatePath(path: string) {
    try {
      const parsedCommands = parsePath(path);
      setPathObject((prevObject) => ({
        path: path,
        commands: parsedCommands,
      }));
      setError(null);
    } catch (e: any) {
      setPathObject((prevObject) => ({
        path: path,
        commands: prevObject.commands,
      }));
      setError(e.message);
    }
  }

  function updateCommands(commands: ParsePath<number>) {
    try {
      const newPath = convertPathToString(commands);
      setPathObject((prevObject) => ({
        path: newPath,
        commands: commands,
      }));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PathContext.Provider
      value={{ pathObject, updatePath, updateCommands, error }}
    >
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
