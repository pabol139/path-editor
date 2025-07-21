import Command from "@/components/commands/Command";
import { usePathObject } from "@/context/PathContext";
import { CollapsedSection } from "@/components/CollapsedSection";
import {
  convertAbsoluteToRelative,
  convertRelativeToAbsolute,
  isRelativeCommand,
  onPointerDownCommand,
  onPointerEnterCommand,
  onPointerLeaveCommand,
} from "@/utils/path";
import React from "react";
import useCommands from "@/hooks/useCommands";

function CommandsSection() {
  const { pathObject, updateCommands } = usePathObject();
  const {
    handleInput,
    handleDelete,
    handleConvertToAbsolute,
    handleConvertToRelative,
    handleCreateCommand,
  } = useCommands();
  const { commands } = pathObject;

  const handleClickCommandLetter = (id_command: string) => {
    const updatedCommands = commands.map((command) => {
      if (id_command !== command.id) return command;

      const isRelative = isRelativeCommand(command.letter);
      let updatedCommand;
      if (isRelative) {
        updatedCommand = convertRelativeToAbsolute(command, commands);
      } else {
        updatedCommand = convertAbsoluteToRelative(command, commands);
      }

      return updatedCommand;
    });
    updateCommands(updatedCommands);
  };

  return (
    <CollapsedSection title="Commands">
      <ul className="pb-5 gap-2 flex flex-col">
        {commands.map(
          ({ id, letter, coordinates, selected, hovered }, index) => (
            <Command
              key={id}
              id={id}
              letter={letter}
              coordinates={coordinates}
              selected={selected}
              hovered={hovered}
              isFirst={index === 0}
              handleEnter={() =>
                onPointerEnterCommand(commands, updateCommands, id)
              }
              handleLeave={() =>
                onPointerLeaveCommand(commands, updateCommands)
              }
              handleDown={() =>
                onPointerDownCommand(commands, updateCommands, id)
              }
              handleInput={handleInput}
              handleDelete={handleDelete}
              handleConvertToRelative={handleConvertToRelative}
              handleConvertToAbsolute={handleConvertToAbsolute}
              handleCreateCommand={handleCreateCommand}
              handleClickCommandLetter={handleClickCommandLetter}
            />
          )
        )}
      </ul>
    </CollapsedSection>
  );
}

export default React.memo(CommandsSection);
