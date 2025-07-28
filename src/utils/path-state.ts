import { DEFAULT_PATH } from "@/context/path-context";
import type { Stack } from "@/types/Path";

const STORAGE_KEY = "path";
const MAX_UNDO_REDO_STACK = 30;

export function limitStack(stack: Stack) {
  return stack.slice(-MAX_UNDO_REDO_STACK);
}

export function updateStack(stack: Stack) {
  return limitStack(stack);
}

export function getInitialPath(): string {
  if (typeof window === "undefined") return DEFAULT_PATH;
  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PATH;
}

export function savePathToStorage(path: string): void {
  if (typeof window === "undefined") return;
  // Only save if it's different from the default to avoid unnecessary storage
  if (path !== DEFAULT_PATH) {
    window.localStorage.setItem(STORAGE_KEY, path);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
