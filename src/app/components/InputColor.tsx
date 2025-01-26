export default function InputColor() {
  return (
    <div className="relative leading-normal text-sm w-fit flex bg-secondary rounded-md py-2">
      <div className="px-2 border-r border-gray300 flex items-center">
        <input type="color" id="colorhex" className="block" />
      </div>
      <output
        name="result"
        htmlFor="colorhex"
        className="  px-2 border-r border-gray300"
      >
        #404040
      </output>
      <div className="px-2 ">
        <input type="text" className="h-5 w-10 block bg-transparent " />
      </div>
    </div>
  );
}
