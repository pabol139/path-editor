"use client";

import { createContext, useContext, useState } from "react";
interface PathProviderProps {
  children: React.ReactNode;
}
const DEFAULT_PATH = "M 200 500 H 500 L 500 220 L 200 220 Z";

export const PathContext = createContext<string>("");
export const SetPathContext = createContext<
  React.Dispatch<React.SetStateAction<string>>
>(() => {});

export function PathProvider({ children }: PathProviderProps) {
  const [path, setPath] = useState<string>(DEFAULT_PATH);

  return (
    <PathContext.Provider value={path}>
      <SetPathContext.Provider value={setPath}>
        {children}
      </SetPathContext.Provider>
    </PathContext.Provider>
  );
}

export function usePath() {
  return useContext(PathContext);
}

export function useSetPath() {
  return useContext(SetPathContext);
}
