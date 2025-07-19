import { isRelativeCommand } from "@/utils/path";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import CommandOptions from "./command-options";
import CommandLetter from "./command-letter";
import { AnimatePresence, motion } from "motion/react";
import SmoothButton from "./smooth-button";

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
  handleDelete,
  handleConvertToRelative,
  handleConvertToAbsolute,
  handleCreateCommand,
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
  handleDelete: (id: string) => void;
  handleConvertToRelative: (id: string) => void;
  handleConvertToAbsolute: (id: string) => void;
  handleCreateCommand: (id: string, letter: string) => void;
}) {
  const [coordinatesDisplayValues, setCoordinatesDisplayValues] = useState(() =>
    coordinates.map((coordinate) => coordinate.toString())
  );

  const coordKey = coordinates.join(",");

  useEffect(() => {
    setCoordinatesDisplayValues(
      coordinates.map((coordinate) => coordinate.toString())
    );
  }, [coordKey]);

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

  const handleDisabledCommand = useCallback((optionLetter: string) => {
    switch (optionLetter.toLocaleUpperCase()) {
      case "T": {
        return (
          letter.toLocaleUpperCase() !== "T" &&
          letter.toLocaleUpperCase() !== "Q"
        );
      }
      case "S": {
        return (
          letter.toLocaleUpperCase() !== "S" &&
          letter.toLocaleUpperCase() !== "C"
        );
      }
      default:
        return false;
    }
  }, []);

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
      className={`pl-4 pr-3 flex justify-between gap-2  ${backgroundColor}`}
      onPointerEnter={handleEnter}
      onPointerDown={handleDown}
      onPointerLeave={handleLeave}
      onFocus={handleDown}
    >
      <div className={`border flex w-fit rounded-md ${borderColor}`}>
        {/* <SmoothButton></SmoothButton> */}
        <CommandLetter
          id={id}
          letter={letter}
          backgroundColorLetter={backgroundColorLetter}
        />
        {coordinatesDisplayValues.map((coordinate, key) => {
          return isCheckbox(key) ? (
            <CommandAtomCheckbox
              key={key}
              index={key}
              coordinate={coordinate}
              updatedCoordinatesDisplayValues={updatedCoordinatesDisplayValues}
              updatedCoordinatesDisplayValuesOnBlur={
                updatedCoordinatesDisplayValuesOnBlur
              }
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
            ></CommandAtom>
          );
        })}
      </div>
      <CommandOptions
        id={id}
        isFirst={isFirst}
        isRelative={isRelative}
        handleConvertToAbsolute={handleConvertToAbsolute}
        handleConvertToRelative={handleConvertToRelative}
        handleDelete={handleDelete}
        handleCreateCommand={handleCreateCommand}
        handleDisabledCommand={handleDisabledCommand}
      ></CommandOptions>
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

function CommandAtomCheckbox({
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
