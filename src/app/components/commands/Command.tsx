export default function Command({
  id,
  letter,
  coordinates,
  selected,
  hovered,
  handleEnter,
  handleLeave,
  handleDown,
}: {
  id: string;
  letter: string;
  coordinates: number[];
  selected: boolean;
  hovered: boolean;
  handleEnter: () => void;
  handleLeave: () => void;
  handleDown: () => void;
}) {
  const backgroundColor = selected
    ? "bg-purple600"
    : hovered
    ? "bg-purple300"
    : "";

  const borderColor = selected ? "border-[#ffffff57]" : "border-gray300";
  return (
    <li
      className={`px-5  ${backgroundColor}`}
      onPointerEnter={handleEnter}
      onPointerDown={handleDown}
      onPointerLeave={handleLeave}
    >
      <div
        className={`border flex w-fit rounded-md overflow-auto ${borderColor}`}
      >
        <div className=" text-sm px-2 py-1 w-8 bg-purple text-center  ">
          {letter}
        </div>
        {coordinates.map((coordinate, key) => {
          return (
            <div
              key={key}
              className="flex items-center bg-secondary text-xs border-r border-gray300 w-10 justify-center last:rounded-tr-md last:rounded-br-md last:border-none"
            >
              <span className="px-1 overflow-auto">{coordinate}</span>
            </div>
          );
        })}
      </div>
    </li>
  );
}
