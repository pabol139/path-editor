"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface FocusHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FocusProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const defaultTransition: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
};

const pathVariants: Array<Variants> = [
  {
    normal: { x: 0, y: 0 },
    animate: { x: 2, y: 2 },
  },
  {
    normal: { x: 0, y: 0 },
    animate: { x: -2, y: 2 },
  },
  {
    normal: { x: 0, y: 0 },
    animate: { x: -2, y: -2 },
  },
  {
    normal: { x: 0, y: 0 },
    animate: { x: 2, y: -2 },
  },
  {
    normal: { scale: 1 },
    animate: { scale: 0.9 },
  },
];

const Focus = forwardRef<FocusHandle, FocusProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

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
          <motion.circle
            variants={pathVariants[4]}
            animate={controls}
            cx="12"
            cy="12"
            r="3"
          />
          <motion.path
            variants={pathVariants[0]}
            animate={controls}
            d="M3 7V5a2 2 0 0 1 2-2h2"
          />
          <motion.path
            variants={pathVariants[1]}
            animate={controls}
            d="M17 3h2a2 2 0 0 1 2 2v2"
          />
          <motion.path
            variants={pathVariants[2]}
            animate={controls}
            d="M21 17v2a2 2 0 0 1-2 2h-2"
          />
          <motion.path
            variants={pathVariants[3]}
            animate={controls}
            d="M7 21H5a2 2 0 0 1-2-2v-2"
          />
        </svg>
      </div>
    );
  }
);

Focus.displayName = "Focus";

export { Focus };
