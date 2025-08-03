import { EllipsisVertical } from "lucide-react";

import CommandActionsWrapper from "./command-actions-wrapper";
import CommandLetter from "./command-letter";
import useCommand from "@/hooks/useCommand";
import CommandAtomsList from "./command-atoms-list";

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
  const {
    isRelative,
    isCheckbox,
    coordinatesDisplayValues,
    updatedCoordinatesDisplayValues,
    updatedCoordinatesDisplayValuesOnBlur,
    handleInputFocus,
  } = useCommand(id, letter, coordinates, handleInput);

  const backgroundColor = selected
    ? "bg-purple600"
    : hovered
    ? "bg-purple300"
    : "";

  const backgroundColorLetter = isRelative ? "bg-[#B15959]" : "bg-purple";
  const borderColor = selected ? "border-[#ffffff57]" : "border-gray300";

  return (
    <li
      role="listitem"
      id={id}
      className={`pl-4 pr-4 flex justify-between gap-2  ${backgroundColor}`}
      // onMouseEnter={handleEnter}
      // onMouseLeave={handleLeave}
      onClick={handleDown}
      onFocus={handleDown}
      aria-selected={selected}
    >
      <div
        role="group"
        aria-labelledby={`command-${id}-label`}
        className={`border flex w-fit rounded-md ${borderColor}`}
      >
        <CommandLetter
          id={id}
          letter={letter}
          backgroundColorLetter={backgroundColorLetter}
          onClick={(e) => {
            e.stopPropagation();
            handleClickCommandLetter(id);
          }}
          aria-label={`Toggle between relative and absolute`}
          aria-description={`Clicking this convert this command to ${
            isRelative ? "absolute" : "relative"
          } `}
        />
        <CommandAtomsList
          isCheckbox={isCheckbox}
          coordinatesDisplayValues={coordinatesDisplayValues}
          updatedCoordinatesDisplayValues={updatedCoordinatesDisplayValues}
          updatedCoordinatesDisplayValuesOnBlur={
            updatedCoordinatesDisplayValuesOnBlur
          }
          handleInputFocus={handleInputFocus}
        ></CommandAtomsList>
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
