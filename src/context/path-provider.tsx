"use client";

import { useRef } from "react";
import { type PathProviderProps, PathContext } from "./path-context";
import usePathState from "@/hooks/usePathState";

export function PathProvider({ children }: PathProviderProps) {
  const pathState = usePathState();
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <PathContext.Provider
      value={{
        ...pathState,
        svgRef,
      }}
    >
      {children}
    </PathContext.Provider>
  );
}
