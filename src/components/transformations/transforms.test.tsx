import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransformSection from "./transforms";
import * as pathUtils from "@/utils/path";
import { createCommandObject } from "@/utils/test-utils";

const testCommands = [
  createCommandObject(1, "M", [10, 20]),
  createCommandObject(2, "m", [10, 20]),
  createCommandObject(3, "L", [30, 40]),
  createCommandObject(4, "l", [30, 40]),
  createCommandObject(5, "V", [50]),
  createCommandObject(6, "v", [50]),
  createCommandObject(7, "H", [60]),
  createCommandObject(8, "h", [60]),
  createCommandObject(9, "C", [70.1, 70, 70, 70, 70, 70]),
  createCommandObject(10, "c", [70.1, 70, 70, 70, 70, 70]),
  createCommandObject(11, "S", [80, -80, 80, 80]),
  createCommandObject(12, "s", [80, -80, 80, 80]),
  createCommandObject(13, "Q", [90, 90, 90, 90]),
  createCommandObject(14, "q", [90, 90, 90, 90]),
  createCommandObject(15, "T", [100, 100]),
  createCommandObject(16, "t", [100, 100]),
  createCommandObject(17, "A", [110, 110, 0, 0, 0, 110, 110]),
  createCommandObject(18, "a", [110, 110, 0, 0, 0, 110, 110]),
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
    const xTranslateInput = screen.getByTestId("xtranslate");
    const yTranslateInput = screen.getByTestId("ytranslate");
    const button = screen.getByTestId("button-translate");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.change(xTranslateInput, { target: { value: "20" } });
    fireEvent.change(yTranslateInput, { target: { value: "20" } });
    fireEvent.click(button);

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveTextContent(
      "M 30 40 m 10 20 L 50 60 l 30 40 V 70 v 50 H 80 h 60 C 90.1 90 90 90 90 90 c 70.1 70 70 70 70 70 S 100 -60 100 100 s 80 -80 80 80 Q 110 110 110 110 q 90 90 90 90 T 120 120 t 100 100 A 110 110 0 0 0 130 130 a 110 110 0 0 0 110 110"
    );
  });

  test("should scale commands", () => {
    const xscaleInput = screen.getByTestId("xscale");
    const yscaleInput = screen.getByTestId("yscale");
    const button = screen.getByTestId("button-scale");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.change(xscaleInput, { target: { value: "2" } });
    fireEvent.change(yscaleInput, { target: { value: "2" } });
    fireEvent.click(button);

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveTextContent(
      "M 20 40 m 20 40 L 60 80 l 60 80 V 100 v 100 H 120 h 120 C 140.2 140 140 140 140 140 c 140.2 140 140 140 140 140 S 160 -160 160 160 s 160 -160 160 160 Q 180 180 180 180 q 180 180 180 180 T 200 200 t 200 200 A 220 220 0 0 0 220 220 a 220 220 0 0 0 220 220"
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
      "m 10 20 m 10 20 l 10 0 l 30 40 v -30 v 50 h 0 h 60 c -49.9 -30 -50 -30 -50 -30 c 70.1 70 70 70 70 70 s -60 -220 -60 -60 s 80 -80 80 80 q -70 -70 -70 -70 q 90 90 90 90 t -80 -80 t 100 100 a 110 110 0 0 0 -90 -90 a 110 110 0 0 0 110 110"
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
      "M 10 20 M 20 40 L 30 40 L 60 80 V 50 V 100 H 60 H 120 C 70.1 70 70 70 70 70 C 140.1 140 140 140 140 140 S 80 -80 80 80 S 160 0 160 160 Q 90 90 90 90 Q 180 180 180 180 T 100 100 T 200 200 A 110 110 0 0 0 110 110 A 110 110 0 0 0 220 220"
    );
  });
});
