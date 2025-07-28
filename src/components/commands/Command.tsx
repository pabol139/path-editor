import { isRelativeCommand } from "@/utils/path";
import { Check, EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";

import CommandActionsWrapper from "./command-actions-wrapper";
import CommandLetter from "./command-letter";

export default function Command({
  id,
  letter,
  coordinates,
  selected,
  hovered,
  isFirst,
  handleEnter,
  handleLeave,
  handleDown,
  handleInput,
  handleClickCommandLetter,
}: {
  id: string;
  letter: string;
  coordinates: number[];
  selected: boolean;
  hovered: boolean;
  isFirst: boolean;
  handleEnter: () => void;
  handleLeave: () => void;
  handleDown: () => void;
  handleInput: (id: string, index: number, parsedValue: number) => void;
  handleClickCommandLetter: (id_command: string) => void;
}) {
  const [coordinatesDisplayValues, setCoordinatesDisplayValues] = useState(() =>
    coordinates.map((coordinate) => coordinate.toString())
  );
  // Track which inputs are currently being edited
  const [focusedInputs, setFocusedInputs] = useState<Set<number>>(new Set());

  const coordKey = coordinates.join(",");

  useEffect(() => {
    // Only update display values for inputs that are NOT currently focused
    setCoordinatesDisplayValues((prevDisplayValues) =>
      coordinates.map((coordinate, index) =>
        focusedInputs.has(index)
          ? prevDisplayValues[index]
          : coordinate.toString()
      )
    );
  }, [coordKey, focusedInputs]);

  const updatedCoordinatesDisplayValues = (index: number, value: string) => {
    const newCoordinatesDisplayValues = [...coordinatesDisplayValues];
    const parsedValue = parseFloat(value);
    newCoordinatesDisplayValues[index] = value;

    if (!isNaN(parsedValue) && parsedValue !== coordinates[index]) {
      handleInput(id, index, parsedValue);
    }
    setCoordinatesDisplayValues(newCoordinatesDisplayValues);
  };

  const updatedCoordinatesDisplayValuesOnBlur = (
    index: number,
    value: string
  ) => {
    const newCoordinatesDisplayValues = [...coordinatesDisplayValues];

    const parsedValue = parseFloat(value);
    var newValue;

    if (!isNaN(parsedValue)) {
      newValue = parsedValue;
      newCoordinatesDisplayValues[index] = String(newValue);
    } else {
      newValue = coordinates[index];
      newCoordinatesDisplayValues[index] = String(newValue);
    }
    setCoordinatesDisplayValues(newCoordinatesDisplayValues);

    if (String(newValue) !== coordinatesDisplayValues[index])
      handleInput(id, index, newValue);

    setFocusedInputs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };
  const handleInputFocus = (index: number) => {
    setFocusedInputs((prev) => new Set(prev).add(index));
  };

  const isRelative = isRelativeCommand(letter);

  const backgroundColor = selected
    ? "bg-purple600"
    : hovered
    ? "bg-purple300"
    : "";

  const backgroundColorLetter = isRelative ? "bg-[#B15959]" : "bg-purple";
  const borderColor = selected ? "border-[#ffffff57]" : "border-gray300";

  const isCheckbox = (index: number) =>
    letter.toLocaleUpperCase() === "A" && (index === 3 || index === 4);

  return (
    <li
      id={id}
      className={`pl-4 pr-4 flex justify-between gap-2  ${backgroundColor}`}
      onPointerEnter={handleEnter}
      onPointerDown={handleDown}
      onPointerLeave={handleLeave}
      onFocus={handleDown}
    >
      <div className={`border flex w-fit rounded-md ${borderColor}`}>
        <CommandLetter
          id={id}
          letter={letter}
          backgroundColorLetter={backgroundColorLetter}
          onClick={() => handleClickCommandLetter(id)}
        />
        {coordinatesDisplayValues.map((coordinate, key) => {
          return isCheckbox(key) ? (
            <CommandAtomCheckbox
              key={key}
              index={key}
              coordinate={coordinate}
              updatedCoordinatesDisplayValues={updatedCoordinatesDisplayValues}
            ></CommandAtomCheckbox>
          ) : (
            <CommandAtom
              key={key}
              index={key}
              coordinate={coordinate}
              updatedCoordinatesDisplayValues={updatedCoordinatesDisplayValues}
              updatedCoordinatesDisplayValuesOnBlur={
                updatedCoordinatesDisplayValuesOnBlur
              }
              handleInputFocus={handleInputFocus}
            ></CommandAtom>
          );
        })}
      </div>
      <CommandActionsWrapper
        id={id}
        isFirst={isFirst}
        isRelative={isRelative}
        commandLetter={letter}
      >
        <button className="focus-visible:outline-[deeppink] focus-visible:outline focus-visible:rounded-sm !text-white hover:bg-gray-600 rounded-sm transition-colors">
          <EllipsisVertical
            size={16}
            className="shrink-0 min-w-4"
          ></EllipsisVertical>
        </button>
      </CommandActionsWrapper>
    </li>
  );
}

function CommandAtom({
  index,
  coordinate,
  updatedCoordinatesDisplayValues,
  updatedCoordinatesDisplayValuesOnBlur,
  handleInputFocus,
}: {
  index: number;
  coordinate: string;
  updatedCoordinatesDisplayValues: (index: number, value: string) => void;
  updatedCoordinatesDisplayValuesOnBlur: (index: number, value: string) => void;
  handleInputFocus: any;
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
        onFocus={() => handleInputFocus(index)}
        value={coordinate}
        className="px-1 overflow-auto tabular-nums bg-transparent h-full text-center w-10 focus-visible:outline-[deeppink] focus-visible:outline group-last:focus-visible:rounded-tr-[5px] group-last:focus-visible:rounded-br-[5px] focus-visible:z-10"
      ></input>
    </div>
  );
}

function CommandAtomCheckbox({
  index,
  coordinate,
  updatedCoordinatesDisplayValues,
}: {
  index: number;
  coordinate: string;
  updatedCoordinatesDisplayValues: (index: number, value: string) => void;
}) {
  return (
    <div className="flex relative items-center bg-secondary text-[10px] text-white border-r border-gray300 w-5 justify-center last:rounded-br-[5px] last:rounded-tr-[5px] last:border-none group">
      <input
        type="checkbox"
        checked={coordinate === "1"}
        onChange={(event) => {
          const formattedValue = event.target.checked ? "1" : "0";
          updatedCoordinatesDisplayValues(index, formattedValue);
        }}
        value={coordinate}
        className="px-1 cursor-pointer appearance-none peer checked:bg-purple checked:border-purple transition-colors h-4 bg-primary border border-gray300 rounded-[4px] overflow-auto text-center w-4 focus-visible:outline-[deeppink] focus-visible:outline group-last:focus-visible:rounded-tr-[5px] group-last:focus-visible:rounded-br-[5px] focus-visible:z-10"
      ></input>
      <Check
        className="absolute 
          w-2 h-2
          opacity-0 peer-checked:block
          peer-checked:opacity-100
          transition-opacity
          pointer-events-none z-20"
      ></Check>
    </div>
  );
}
