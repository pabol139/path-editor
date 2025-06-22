import Command from "@/components/commands/Command";
import { usePathObject } from "@/context/PathContext";
import { CollapsedSection } from "@/components/CollapsedSection";
import {
  onPointerDownCommand,
  onPointerEnterCommand,
  onPointerLeaveCommand,
} from "@/utils/path";

export default function CommandsSection() {
  const { pathObject, updateCommands } = usePathObject();
  const commands = pathObject.commands;

  const handlerEnter = (id_command: string) => {
    const newCommands = commands.map((command) => {
      if (command.id !== id_command) return { ...command, hovered: false }; // Return unmodified command

      return { ...command, hovered: true }; // Return new object
    });

    updateCommands(newCommands);
  };

  const handlerLeave = () => {
    const newCommands = commands.map((command) => {
      return { ...command, hovered: false }; // Return new object
    });

    updateCommands(newCommands);
  };

  const handleDown = (id_command: string) => {
    const newCommands = commands.map((command) => {
      if (command.id !== id_command) return { ...command, selected: false }; // Return unmodified command

      return { ...command, selected: true }; // Return new object
    });

    updateCommands(newCommands);
  };

  return (
    <CollapsedSection title="Commands">
      <ul className="pb-5  gap-2 flex flex-col">
        {commands.map(({ id, letter, coordinates, selected, hovered }, key) => (
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
          />
        ))}
      </ul>
    </CollapsedSection>
  );
}
