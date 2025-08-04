import { Check } from "lucide-react";

export default function CommandAtomsList({
  isCheckbox,
  updatedCoordinatesDisplayValuesOnBlur,
  updatedCoordinatesDisplayValues,
  coordinatesDisplayValues,
  handleInputFocus,
}: {
  isCheckbox: (index: number) => boolean;
  coordinatesDisplayValues: string[];
  updatedCoordinatesDisplayValues: (index: number, value: string) => void;
  updatedCoordinatesDisplayValuesOnBlur: (index: number, value: string) => void;
  handleInputFocus: (index: number) => void;
}) {
  return (
    <>
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
    </>
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
        inputMode="decimal"
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
          opacity-0 peer-checked:inline-block
          peer-checked:opacity-100
          transition-opacity
          pointer-events-none z-20"
      ></Check>
    </div>
  );
}
