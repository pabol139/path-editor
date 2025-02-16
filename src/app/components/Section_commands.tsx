import SectionHeader from "./SectionHeader";
import Command from "./Command";
import { usePath } from "../context/PathContext";
import { parsePath } from "../utils/pathUtils";

export default function CommandsSection() {
  const path = usePath();
  const commands = parsePath(path);

  return (
    <section className=" pb-5 border-b border-secondary">
      <SectionHeader title="Commands"></SectionHeader>
      <div className="px-5 gap-2 flex flex-col">
        {commands.map((command, key) => (
          <Command
            key={key}
            letter={command.letter}
            coordinates={command.coordinates}
          />
        ))}
      </div>
    </section>
  );
}
