"use client";

import { createContext, useContext, useState } from "react";
import { PathObject, ParsePath } from "@/types/Path";
import { convertPathToString, parsePath } from "@/utils/path";
interface PathProviderProps {
  children: React.ReactNode;
}
const DEFAULT_PATH =
  "M 4 8 L 10 1 L 13 0 L 12 3 L 5 9 C 6 10 6 11 7 10 C 7 11 8.3 11.89 7 12 A 1.42 1.42 0 0 1 6 13 A 5 5 0 0 0 4 10 Q 3.5 9.9 3.5 10.5 T 2 11.8 T 1.2 11 T 2.5 9.5 T 3 9 A 5 5 90 0 0 0 7 A 1.42 1.42 0 0 1 1 6 C 1.1 4.51 2.27 5.93 3 6 C 2.49 7.41 3.99 6.61 4 8 M 10 1 L 10 3 L 12 3 L 10.2 2.8 L 10 1";

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
      console.log(e);
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
