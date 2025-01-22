import { ChevronDown } from "react-feather";

export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className="relative px-5 py-5 w-full">
      <h3 className="lowercase first-letter:uppercase">{title}</h3>
      <button className="absolute flex items-center justify-end pr-5 right-0 top-0 w-full h-full">
        <ChevronDown size={20}></ChevronDown>
      </button>
    </div>
  );
}
