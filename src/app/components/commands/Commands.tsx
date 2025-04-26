import Command from "@/components/commands/Command";
import { usePathObject } from "@/context/PathContext";
import { CollapsedSection } from "@/components/CollapsedSection";

export default function CommandsSection() {
  const { pathObject } = usePathObject();
  const commands = pathObject.commands;

  return (
    <CollapsedSection title="Commands">
      <div className="px-5 pb-5  gap-2 flex flex-col">
        {commands.map((command, key) => (
          <Command
            key={key}
            letter={command.letter}
            coordinates={command.coordinates}
          />
        ))}
      </div>
    </CollapsedSection>
  );
}
