"use client";
import { ParsePath } from "@/types/Path";
import { parsePath, convertCommandsToPath, formatCommands } from "@/utils/path";
import { useRef, useState } from "react";
import { PathProviderProps, DEFAULT_PATH, PathContext } from "./PathContext";

export function PathProvider({ children }: PathProviderProps) {
  const [pathObject, setPathObject] = useState({
    path: DEFAULT_PATH,
    commands: parsePath(DEFAULT_PATH),
  });
  const svgRef = useRef<SVGSVGElement>(null);

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

  function updateCommands(
    commands:
      | ParsePath<number>
      | ((currentCommands: ParsePath<number>) => ParsePath<number>)
  ) {
    try {
      setPathObject((prevObject) => {
        // Handle functional updates
        const newCommands =
          typeof commands === "function"
            ? commands(prevObject.commands)
            : commands;

        const formatedCommands = formatCommands(newCommands, 2);
        const newPath = convertCommandsToPath(formatedCommands);

        return {
          path: newPath,
          commands: formatedCommands,
        };
      });
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PathContext.Provider
      value={{ pathObject, updatePath, updateCommands, error, svgRef }}
    >
      {children}
    </PathContext.Provider>
  );
}
