import { isRelativeCommand } from "@/utils/path";
import { useEffect, useState } from "react";

export default function useCommand(
  id: string,
  letter: string,
  coordinates: Array<number>,
  handleInput: (id: string, index: number, parsedValue: number) => void
) {
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
  const isCheckbox = (index: number) =>
    letter.toLocaleUpperCase() === "A" && (index === 3 || index === 4);

  return {
    isRelative,
    isCheckbox,
    coordinatesDisplayValues,
    updatedCoordinatesDisplayValues,
    updatedCoordinatesDisplayValuesOnBlur,
    handleInputFocus,
  };
}
