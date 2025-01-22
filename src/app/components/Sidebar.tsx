import Input from "./Input";
import { ChevronDown } from "react-feather";

export default function Sidebar() {
  return (
    <aside className="absolute border-l bg-primary border-secondary top-0 right-0 h-full text-tertiary w-full max-w-[326px]">
      <section className="bg-secondary px-5 py-3">
        <h3 className="text-sm">Path</h3>
        <textarea
          className="mt-2 w-full bg-secondary text-base"
          name=""
          id=""
          cols="30"
          rows="3"
        ></textarea>
      </section>
      <section className=" pb-5 border-b border-secondary">
        <div className="relative px-5 py-5 w-full">
          <h3>Viewbox</h3>
          <button className="absolute flex items-center justify-end pr-5 right-0 top-0 w-full h-full">
            <ChevronDown size={20}></ChevronDown>
          </button>
        </div>

        <div className="grid px-5 w-fit mt-1 grid-cols-2 gap-2">
          {Array.from(["X", "Y", "W", "H"]).map((char, index) => {
            return <Input leftText={char} key={index} />;
          })}
        </div>
      </section>
      <section className="px-5 py-3 ">
        <h3>Path Transform</h3>
      </section>
      <section className="px-5 py-3 ">
        <h3>Style</h3>
      </section>
      <section className="px-5 py-3 ">
        <h3>Commands</h3>
      </section>
    </aside>
  );
}
