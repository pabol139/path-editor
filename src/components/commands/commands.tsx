import Command from "@/components/commands/command";
import { usePathObject } from "@/context/path-context";
import { CollapsedSection } from "@/components/collapsed-section";
import {
  convertAbsoluteToRelative,
  convertRelativeToAbsolute,
  isRelativeCommand,
} from "@/utils/path";
import React, { useCallback } from "react";
import useCommands from "@/hooks/useCommands";
import CommandCreateWrapper from "./command-create-wrapper";

function CommandsSection() {
  const { pathObject, updateCommands } = usePathObject();
  const { handleInput } = useCommands();
  const { commands } = pathObject;

  const handleClickCommandLetter = useCallback(
    (id_command: string) => {
      updateCommands((currentCommands) => {
        return currentCommands.map((command) => {
          if (id_command !== command.id) return command;

          const isRelative = isRelativeCommand(command.letter);
          let updatedCommand;
          if (isRelative) {
            updatedCommand = convertRelativeToAbsolute(command);
          } else {
            updatedCommand = convertAbsoluteToRelative(command);
          }

          return updatedCommand;
        });
      });
    },
    [updateCommands]
  );

  const enter = useCallback(
    (id_command: string) => {
      updateCommands((currentCommands) => {
        return currentCommands.map((command) => {
          if (command.id !== id_command) return { ...command, hovered: false }; // Return unmodified command

          return { ...command, hovered: true }; // Return new object
        });
      }, false);
    },
    [updateCommands]
  );

  const leave = useCallback(() => {
    updateCommands((currentCommands) => {
      return currentCommands.map((command) => {
        return { ...command, hovered: false };
      });
    }, false);
  }, [updateCommands]);

  const down = useCallback(
    (id_command: string) => {
      updateCommands((currentCommands) => {
        return currentCommands.map((command) => {
          if (command.id !== id_command) return { ...command, selected: false };

          return { ...command, selected: true };
        });
      }, false);
    },
    [updateCommands]
  );

  return (
    <>
      <CollapsedSection title="Commands">
        <ul
          role="list"
          aria-label={`${commands.length} path commands`}
          className="pb-5 gap-2 flex flex-col pt-1 [&_*]:!outline-offset-0 [&_*]:!outline-[deeppink]"
        >
          {commands.length > 0 ? (
            commands.map(
              ({ id, letter, coordinates, selected, hovered }, index) => (
                <Command
                  key={id}
                  id={id}
                  letter={letter}
                  coordinates={coordinates.join(",")}
                  selected={selected}
                  hovered={hovered}
                  isFirst={index === 0}
                  handleEnter={enter}
                  handleLeave={leave}
                  handleDown={down}
                  handleInput={handleInput}
                  handleClickCommandLetter={handleClickCommandLetter}
                />
              )
            )
          ) : (
            <div className="w-full px-4">
              <CommandCreateWrapper>
                <button className="w-full bg-purple h-10 rounded-md transition-transform active:scale-[.98]">
                  Add new command
                </button>
              </CommandCreateWrapper>
            </div>
          )}
        </ul>
      </CollapsedSection>
    </>
  );
}

export default React.memo(CommandsSection);
