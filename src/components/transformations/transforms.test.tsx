import { render, screen, fireEvent, renderHook } from "@testing-library/react";
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

const testCommands = [
  createCommandObject("M", [10, 20]),
  createCommandObject("l", [30, 40]),
  createCommandObject("V", [50]),
  createCommandObject("h", [60]),
  createCommandObject("c", [70, 70, 70, 70, 70, 70]),
  createCommandObject("S", [80, 80, 80, 80]),
  createCommandObject("Q", [90, 90, 90, 90]),
  createCommandObject("t", [100, 100]),
  createCommandObject("A", [110, 110, 0, 0, 0, 110, 110]),
];

import { usePathObject } from "@/context/path-context";
import { useEffect } from "react";
import { PathProvider } from "@/context/path-provider";
import PathInput from "../path/path-input";

// Helper component to set up test data
const TestSetup = ({ commands }: { commands: any[] }) => {
  const { updateCommands } = usePathObject();

  useEffect(() => {
    updateCommands(commands);
  }, []);

  return null;
};

const mockedPathInputProps = {
  svgDimensions: { width: 100, height: 100 },
  updateViewbox: jest.fn(),
  setSvgDimensions: jest.fn(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PathProvider>
      <TestSetup commands={testCommands} />
      <PathInput {...mockedPathInputProps}></PathInput>
      {children}
    </PathProvider>
  );
};

describe("transforms section", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<TransformSection />, { wrapper });
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
    const translateSpy = jest.spyOn(pathUtils, "translate");

    const xTranslateInput = screen.getByTestId("xtranslate");
    const yTranslateInput = screen.getByTestId("ytranslate");
    const button = screen.getByTestId("button-translate");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.change(xTranslateInput, { target: { value: "20" } });
    fireEvent.change(yTranslateInput, { target: { value: "20" } });
    fireEvent.click(button);

    expect(translateSpy).toHaveBeenCalledWith(testCommands, "20", "20");

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveTextContent(
      "M 30 40 l 30 40 V 70 h 60 c 70 70 70 70 70 70 S 100 100 100 100 Q 110 110 110 110 t 100 100 A 110 110 0 0 0 130 130"
    );
  });

  test("should scale commands", () => {
    const scaleSpy = jest.spyOn(pathUtils, "scale");

    const xscaleInput = screen.getByTestId("xscale");
    const yscaleInput = screen.getByTestId("yscale");
    const button = screen.getByTestId("button-scale");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.change(xscaleInput, { target: { value: "2" } });
    fireEvent.change(yscaleInput, { target: { value: "2" } });
    fireEvent.click(button);

    expect(scaleSpy).toHaveBeenCalledWith(testCommands, "2", "2");

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveTextContent(
      "M 20 40 l 60 80 V 100 h 120 c 140 140 140 140 140 140 S 160 160 160 160 Q 180 180 180 180 t 200 200 A 220 220 0 0 0 220 220"
    );
  });

  test("should convert commands to relative", () => {
    const convertCommandsAbsoluteToRelativeSpy = jest.spyOn(
      pathUtils,
      "convertCommandsAbsoluteToRelative"
    );

    const toRelativeButton = screen.getByRole("button", {
      name: /to relative/i,
    });
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.click(toRelativeButton);

    expect(convertCommandsAbsoluteToRelativeSpy).toHaveBeenCalled();
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveTextContent(
      "m 10 20 l 30 40 v -10 h 60 c 70 70 70 70 70 70 s -90 -40 -90 -40 q 10 10 10 10 t 100 100 a 110 110 0 0 0 -80 -80"
    );
  });

  test("should convert commands to absolute", () => {
    const convertCommandsRelativeToAbsolute = jest.spyOn(
      pathUtils,
      "convertCommandsRelativeToAbsolute"
    );

    const toAbsoluteButton = screen.getByRole("button", {
      name: /to absolute/i,
    });
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.click(toAbsoluteButton);

    expect(convertCommandsRelativeToAbsolute).toHaveBeenCalled();
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveTextContent(
      "M 10 20 L 40 60 V 50 H 100 C 170 120 170 120 170 120 S 80 80 80 80 Q 90 90 90 90 T 190 190 A 110 110 0 0 0 110 110"
    );
  });
});
