"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SplinePointerHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SplinePointerProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const defaultTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

const pathVariants: Array<Variants> = [
  {
    normal: { x: 0, y: 0 },
    animate: { x: -1, y: -1 },
  },
  {
    normal: { d: "M5 17A12 12 0 0 1 17 5" },
    animate: { d: "M 5 17 A 10 10 0 0 1 17 5" },
  },
];

const SplinePointer = forwardRef<SplinePointerHandle, SplinePointerProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(
      ref,
      () => {
        isControlledRef.current = true;
        return {
          startAnimation: () => controls.start("animate"),
          stopAnimation: () => controls.start("normal"),
        };
      },
      [controls]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("animate");
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("normal");
        } else {
          onMouseLeave?.(e);
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            transition={defaultTransition}
            animate={controls}
            variants={pathVariants[0]}
            d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"
          />
          <motion.path
            transition={defaultTransition}
            variants={pathVariants[1]}
            animate={controls}
            d="M5 17A12 12 0 0 1 17 5"
          />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
        </svg>
      </div>
    );
  }
);

SplinePointer.displayName = "SplinePointer";

export { SplinePointer };
