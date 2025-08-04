import { LINE_COMMANDS } from "@/constants/path";
import { usePathObject } from "@/context/path-context";
import {
  convertAbsoluteToRelative,
  convertRelativeToAbsolute,
  createCommand,
  getSvgCenter,
} from "@/utils/path";
import { useCallback, useRef } from "react";

export default function useCommandActions() {
  const { updateCommands, svgRef, pathObject } = usePathObject();
  const commandsCounter = useRef(pathObject.commands.length);

  const handleDelete = useCallback(
    (id: string) => {
      updateCommands((currentCommands) => {
        return currentCommands.filter((command) => command.id !== id);
      });
    },
    [updateCommands]
  );

  const handleConvertToRelative = useCallback(
    (id: string) => {
      updateCommands((currentCommands) => {
        return currentCommands.map((command) => {
          if (command.id !== id) return command;
          const relativeCommand = convertAbsoluteToRelative(
            command,
            currentCommands
          );
          return relativeCommand;
        });
      });
    },
    [updateCommands]
  );

  const handleConvertToAbsolute = useCallback(
    (id: string) => {
      updateCommands((currentCommands) => {
        return currentCommands.map((command) => {
          if (command.id !== id) return command;
          const relativeCommand = convertRelativeToAbsolute(
            command,
            currentCommands
          );
          return relativeCommand;
        });
      });
    },
    [updateCommands]
  );

  const handleCreateCommand = useCallback(
    (id: string, letter: string) => {
      updateCommands((currentCommands) => {
        if (currentCommands.length === 0) {
          const centerOfSvg = getSvgCenter(svgRef);
          if (letter.toLocaleUpperCase() === LINE_COMMANDS.MoveTo) {
            const startCommand = createCommand(letter, centerOfSvg, 1);

            commandsCounter.current = 1;

            return [startCommand];
          } else {
            const startCommand = createCommand("M", centerOfSvg, 1);
            const newCommand = createCommand(letter, centerOfSvg, 2);

            commandsCounter.current = 2;

            return [startCommand, { ...newCommand, selected: false }];
          }
        }

        const selectedIndex = currentCommands.findIndex(
          (command) => command.id === id
        );
        if (selectedIndex === -1) return currentCommands; // Command not found

        const centerOfSvg = getSvgCenter(svgRef);
        const newCommand = createCommand(
          letter,
          centerOfSvg,
          commandsCounter.current
        );
        const formatedCommands = currentCommands.map((command) => ({
          ...command,
          selected: false,
        }));
        return [
          ...formatedCommands.slice(0, selectedIndex + 1),
          newCommand,
          ...formatedCommands.slice(selectedIndex + 1),
        ];
      });
      commandsCounter.current = commandsCounter.current + 1;
    },
    [updateCommands, commandsCounter.current]
  );

  const handleDisabledCommand = useCallback(
    (letter: string, optionLetter: string) => {
      switch (optionLetter.toLocaleUpperCase()) {
        case "T": {
          return (
            letter.toLocaleUpperCase() !== "T" &&
            letter.toLocaleUpperCase() !== "Q"
          );
        }
        case "S": {
          return (
            letter.toLocaleUpperCase() !== "S" &&
            letter.toLocaleUpperCase() !== "C"
          );
        }
        default:
          return false;
      }
    },
    []
  );

  return {
    handleDelete,
    handleConvertToRelative,
    handleConvertToAbsolute,
    handleCreateCommand,
    handleDisabledCommand,
  };
}
