import Command from "@/components/commands/Command";
import { usePathObject } from "@/context/PathContext";
import { CollapsedSection } from "@/components/CollapsedSection";
import {
  onPointerDownCommand,
  onPointerEnterCommand,
  onPointerLeaveCommand,
} from "@/utils/path";
import React from "react";

function CommandsSection() {
  const { pathObject, updateCommands } = usePathObject();
  const commands = pathObject.commands;

  const handleInput = (
    id_command: string,
    index: number,
    parsedValue: number
  ) => {
    if (!isNaN(parsedValue)) {
      const newCommands = pathObject.commands.map((command) => {
        if (command.id === id_command) {
          const newCoordinates = command.coordinates;
          newCoordinates[index] = Number(parsedValue);
          return {
            ...command,
            coodinates: newCoordinates,
          };
        }
        return command;
      });
      updateCommands(newCommands);
    }
  };

  return (
    <CollapsedSection title="Commands">
      <ul className="pb-5  gap-2 flex flex-col">
        {commands.map(({ id, letter, coordinates, selected, hovered }) => (
          <Command
            key={id}
            id={id}
            letter={letter}
            coordinates={coordinates}
            selected={selected}
            hovered={hovered}
            handleEnter={() =>
              onPointerEnterCommand(commands, updateCommands, id)
            }
            handleLeave={() => onPointerLeaveCommand(commands, updateCommands)}
            handleDown={() =>
              onPointerDownCommand(commands, updateCommands, id)
            }
            handleInput={handleInput}
          />
        ))}
      </ul>
    </CollapsedSection>
  );
}

export default React.memo(CommandsSection);
