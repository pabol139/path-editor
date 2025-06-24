import { isRelativeCommand } from "@/utils/path";
import { useEffect, useState } from "react";

export default function Command({
  id,
  letter,
  coordinates,
  selected,
  hovered,
  handleEnter,
  handleLeave,
  handleDown,
  handleInput,
}: {
  id: string;
  letter: string;
  coordinates: number[];
  selected: boolean;
  hovered: boolean;
  handleEnter: () => void;
  handleLeave: () => void;
  handleDown: () => void;
  handleInput: (id: string, index: number, parsedValue: number) => void;
}) {
  const [coordinatesDisplayValues, setCoordinatesDisplayValues] = useState(() =>
    coordinates.map((coordinate) => coordinate.toString())
  );

  useEffect(() => {
    setCoordinatesDisplayValues(
      coordinates.map((coordinate) => coordinate.toString())
    );
  }, [coordinates]);

  const updatedCoordinatesDisplayValues = (index: number, value: string) => {
    const newCoordinatesDisplayValues = [...coordinatesDisplayValues];
    const parsedValue = parseFloat(value);
    newCoordinatesDisplayValues[index] = value;

    if (!isNaN(parsedValue)) handleInput(id, index, parsedValue);
    setCoordinatesDisplayValues(newCoordinatesDisplayValues);
  };

  const updatedCoordinatesDisplayValuesOnBlur = (
    index: number,
    value: string
  ) => {
    const newCoordinatesDisplayValues = [...coordinatesDisplayValues];

    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      newCoordinatesDisplayValues[index] = String(parsedValue);
      setCoordinatesDisplayValues(newCoordinatesDisplayValues);
      handleInput(id, index, parsedValue);
    } else {
      newCoordinatesDisplayValues[index] = String(coordinates[index]);
      handleInput(id, index, coordinates[index]);
      setCoordinatesDisplayValues(newCoordinatesDisplayValues);
    }
  };

  const backgroundColor = selected
    ? "bg-purple600"
    : hovered
    ? "bg-purple300"
    : "";

  const backgroundColorLetter = isRelativeCommand(letter)
    ? "bg-[#B15959]"
    : "bg-purple";
  const borderColor = selected ? "border-[#ffffff57]" : "border-gray300";
  return (
    <li
      className={`px-5  ${backgroundColor}`}
      onPointerEnter={handleEnter}
      onPointerDown={handleDown}
      onPointerLeave={handleLeave}
      onFocus={handleDown}
    >
      <div className={`border flex w-fit rounded-md ${borderColor}`}>
        <div
          className={`text-sm px-2 py-1 w-8 ${backgroundColorLetter} text-center rounded-tl-[5px] rounded-bl-[5px]`}
        >
          {letter}
        </div>
        {coordinatesDisplayValues.map((coordinate, key) => (
          <CommandAtom
            key={key}
            index={key}
            coordinate={coordinate}
            updatedCoordinatesDisplayValues={updatedCoordinatesDisplayValues}
            updatedCoordinatesDisplayValuesOnBlur={
              updatedCoordinatesDisplayValuesOnBlur
            }
          ></CommandAtom>
        ))}
      </div>
    </li>
  );
}

function CommandAtom({
  index,
  coordinate,
  updatedCoordinatesDisplayValues,
  updatedCoordinatesDisplayValuesOnBlur,
}: {
  index: number;
  coordinate: string;
  updatedCoordinatesDisplayValues: (index: number, value: string) => void;
  updatedCoordinatesDisplayValuesOnBlur: (index: number, value: string) => void;
}) {
  return (
    <div className="flex items-center bg-secondary text-[10px] text-white border-r border-gray300 w-10 justify-center last:rounded-br-[5px] last:rounded-tr-[5px] last:border-none group">
      <input
        type="text"
        onChange={(event) => {
          var formattedValue = event.target.value
            .replace(/,/g, ".")
            .replace(/[^0-9\.-]/g, "");

          updatedCoordinatesDisplayValues(index, formattedValue);
        }}
        onBlur={(event) => {
          var formattedValue = event.target.value
            .replace(/,/g, ".")
            .replace(/[^0-9\.-]/g, "");

          updatedCoordinatesDisplayValuesOnBlur(index, formattedValue);
        }}
        value={coordinate}
        className="px-1 overflow-auto bg-transparent h-full text-center w-10 focus-visible:outline-[deeppink] focus-visible:outline group-last:focus-visible:rounded-tr-[5px] group-last:focus-visible:rounded-br-[5px] focus-visible:z-10"
      ></input>
    </div>
  );
}
