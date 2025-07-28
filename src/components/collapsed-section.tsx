import { type ReactNode, useState } from "react";
import SectionHeader from "@/components/section-header";

export function CollapsedSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  const handleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <section className=" border-b border-secondary ">
      <SectionHeader
        title={title}
        expanded={expanded}
        setter={handleExpanded}
      ></SectionHeader>
      <div
        className={`${
          expanded ? "expanded" : ""
        } grid overflow-hidden grid-rows-[0fr] transition-[grid-template-rows] duration-300 [&.expanded]:grid-rows-[1fr]`}
      >
        <div className="min-h-0 invisible transition-[visibility] duration-300 [.expanded_&]:visible">
          {children}
        </div>
      </div>
    </section>
  );
}
