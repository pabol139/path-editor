import Input from "./Input";
import SectionHeader from "./SectionHeader";
import { XSquare } from "react-feather";

export default function Sidebar() {
  return (
    <aside className="absolute overflow-auto border-l bg-primary border-secondary top-0 right-0 h-full text-tertiary w-full max-w-[326px]">
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
        <SectionHeader title="Viewbox"></SectionHeader>
        <div className="grid px-5 w-fit mt-1 grid-cols-2 gap-2">
          {Array.from(["X", "Y", "W", "H"]).map((char, index) => {
            return <Input leftText={char} key={index} />;
          })}
        </div>
      </section>
      <section className=" pb-5 border-b border-secondary">
        <SectionHeader title="Path Transform"></SectionHeader>
        <div className="px-5 space-y-4">
          <div>
            <h4 className="text-gray100">Translate</h4>
            <div className="flex gap-2 mt-3">
              {Array.from(["x", "y"]).map((char, index) => {
                return <Input leftText={char} key={index} />;
              })}
              <button>
                <XSquare size={28}></XSquare>
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-gray100">Rotate</h4>
            <div className="flex gap-2 mt-3">
              {Array.from(["x", "y"]).map((char, index) => {
                return <Input leftText={char} key={index} />;
              })}
            </div>
          </div>
          <div>
            <h4 className="text-gray100">Scale</h4>
            <div className="flex gap-2 mt-3">
              {Array.from(["x", "y"]).map((char, index) => {
                return <Input leftText={char} key={index} />;
              })}
            </div>
          </div>
          <div className="text-xs flex justify-start gap-3 !mt-8">
            <button className="px-2 py-3 border border-tertiary rounded-md bg-purple">
              Convert to absolute
            </button>
            <button className="px-2  py-3 border border-tertiary rounded-md bg-purple">
              Convert to relative
            </button>
          </div>
        </div>
      </section>
      <section className=" pb-5 border-b border-secondary">
        <SectionHeader title="Style"></SectionHeader>
      </section>
      <section className=" pb-5 border-b border-secondary">
        <SectionHeader title="Commands"></SectionHeader>
      </section>
    </aside>
  );
}
