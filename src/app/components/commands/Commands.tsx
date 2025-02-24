import Command from "./Command";
import { usePath } from "../../context/PathContext";
import { parsePath } from "../../utils/pathUtils";
import { CollapsedSection } from "../CollapsedSection";

export default function CommandsSection() {
  const path = usePath();
  const commands = parsePath(path);

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
