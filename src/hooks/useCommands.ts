import { usePathObject } from "@/context/path-context";
import { useCallback } from "react";

export default function useCommands() {
  const { updateCommands } = usePathObject();

  const handleInput = useCallback(
    (id_command: string, index: number, parsedValue: number) => {
      if (!isNaN(parsedValue)) {
        updateCommands((currentCommands) => {
          return currentCommands.map((command) => {
            if (command.id === id_command) {
              const newCoordinates = [...command.coordinates];
              newCoordinates[index] = Number(parsedValue);
              return {
                ...command,
                coordinates: newCoordinates,
              };
            }
            return command;
          });
        });
      }
    },
    [updateCommands]
  );

  return {
    handleInput,
  };
}
