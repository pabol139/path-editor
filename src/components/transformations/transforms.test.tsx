import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransformSection from "./Transforms";
import * as pathUtils from "@/utils/path";

const createCommandObject = (
  letter: string,
  coordinates: number[],
  overrides = {}
) => ({
  id: expect.any(String),
  letter,
  coordinates,
  hovered: false,
  selected: false,
  ...overrides,
});

const mockUpdateCommands = jest.fn();
jest.mock("@/context/path-context", () => ({
  usePathObject: () => ({
    pathObject: {
      commands: [
        createCommandObject("M", [10, 20]),
        createCommandObject("l", [30, 40]),
        createCommandObject("L", [50, 60]),
      ],
    },
    updateCommands: mockUpdateCommands,
  }),
}));

import { usePathObject } from "@/context/path-context";

describe("transforms section", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<TransformSection />);
  });

  test("renders translate and scale rows and buttons", () => {
    expect(screen.getByTestId("xtranslate")).toBeInTheDocument();
    expect(screen.getByTestId("ytranslate")).toBeInTheDocument();
    expect(screen.getByTestId("xscale")).toBeInTheDocument();
    expect(screen.getByTestId("yscale")).toBeInTheDocument();
    expect(screen.getByTestId("button-translate")).toBeInTheDocument();
    expect(screen.getByTestId("button-scale")).toBeInTheDocument();
    expect(screen.getByText("To absolute")).toBeInTheDocument();
    expect(screen.getByText("To relative")).toBeInTheDocument();
  });

  test("should translate commands", () => {
    const { pathObject } = usePathObject();
    const translateSpy = jest.spyOn(pathUtils, "translate");

    const xTranslateInput = screen.getByTestId("xtranslate");
    const yTranslateInput = screen.getByTestId("ytranslate");
    const button = screen.getByTestId("button-translate");

    fireEvent.change(xTranslateInput, { target: { value: "20" } });
    fireEvent.change(yTranslateInput, { target: { value: "20" } });
    fireEvent.click(button);

    expect(translateSpy).toHaveBeenCalledWith(pathObject.commands, "20", "20");

    const expected = pathUtils.translate(pathObject.commands, "20", "20");

    expect(mockUpdateCommands).toHaveBeenCalledWith(expected);

    // Check the updated commands values
  });

  test("should scale commands", () => {
    const { pathObject } = usePathObject();
    const scaleSpy = jest.spyOn(pathUtils, "scale");

    const xscaleInput = screen.getByTestId("xscale");
    const yscaleInput = screen.getByTestId("yscale");
    const button = screen.getByTestId("button-scale");

    fireEvent.change(xscaleInput, { target: { value: "2" } });
    fireEvent.change(yscaleInput, { target: { value: "2" } });
    fireEvent.click(button);

    expect(scaleSpy).toHaveBeenCalledWith(pathObject.commands, "2", "2");

    const expected = pathUtils.scale(pathObject.commands, "2", "2");

    expect(mockUpdateCommands).toHaveBeenCalledWith(expected);
  });

  test("should convert commands to relative", () => {
    const convertCommandsAbsoluteToRelativeSpy = jest.spyOn(
      pathUtils,
      "convertCommandsAbsoluteToRelative"
    );

    const toRelativeButton = screen.getByRole("button", {
      name: /to relative/i,
    });
    fireEvent.click(toRelativeButton);

    expect(convertCommandsAbsoluteToRelativeSpy).toHaveBeenCalled();
    expect(mockUpdateCommands).toHaveBeenCalled();
  });

  test("should convert commands to absolute", () => {
    const convertCommandsRelativeToAbsolute = jest.spyOn(
      pathUtils,
      "convertCommandsRelativeToAbsolute"
    );

    const toAbsoluteButton = screen.getByRole("button", {
      name: /to absolute/i,
    });
    fireEvent.click(toAbsoluteButton);

    expect(convertCommandsRelativeToAbsolute).toHaveBeenCalled();
    expect(mockUpdateCommands).toHaveBeenCalled();
  });
});
