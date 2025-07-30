import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Svg from "./svg";
import { useEffect } from "react";
import { PathProvider } from "@/context/path-provider";
import PathInput from "../path/path-input";
import { usePathObject } from "@/context/path-context";

const mockUpdateViewbox = jest.fn();
const mockSetSvgDimensions = jest.fn();

const defaultProps = {
  svgDimensions: { width: 100, height: 100 },
  viewbox: {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  },
  setSvgDimensions: mockSetSvgDimensions,
  updateViewbox: mockUpdateViewbox,
};

const createCommandObject = (
  count: number,
  letter: string,
  coordinates: number[],
  overrides = {}
) => ({
  id: count + letter,
  letter,
  coordinates,
  hovered: false,
  selected: false,
  ...overrides,
});

const testCommands = [
  createCommandObject(1, "M", [10, 20]),
  createCommandObject(2, "l", [30, 40]),
  createCommandObject(3, "V", [50]),
  createCommandObject(4, "h", [60]),
  createCommandObject(5, "c", [70, 70, 70, 70, 70, 70]),
  createCommandObject(6, "S", [80, 80, 80, 80]),
  createCommandObject(7, "Q", [90, 90, 90, 90]),
  createCommandObject(8, "t", [100, 100]),
  createCommandObject(9, "A", [110, 110, 0, 0, 0, 110, 110]),
];

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

// Mock getBBox for SVG elements
Object.defineProperty(SVGElement.prototype, "getBBox", {
  value: jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }),
  configurable: true,
});
Object.defineProperty(SVGElement.prototype, "createSVGPoint", {
  value: jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    matrixTransform: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
    }),
  }),
  configurable: true,
});

Object.defineProperty(SVGElement.prototype, "getScreenCTM", {
  value: jest.fn().mockReturnValue({
    inverse: jest.fn(),
  }),
  configurable: true,
});

Object.defineProperty(Element.prototype, "setPointerCapture", {
  value: jest.fn(),
  configurable: true,
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PathProvider>
      <TestSetup commands={testCommands} />
      <PathInput {...mockedPathInputProps}></PathInput>
      {children}
    </PathProvider>
  );
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("points", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Svg {...defaultProps}></Svg>, { wrapper });
  });

  test("should open context menu on circle right click", async () => {
    const circle = screen.getByLabelText("Control point circle_2l_0 at 40, 60");

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("should delete command in context menu", async () => {
    const circle = screen.getByLabelText("Control point circle_2l_0 at 40, 60");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    const deleteButton = screen.getByRole("menuitem", {
      name: /delete/i,
    });

    fireEvent.click(deleteButton);

    expect(textarea).toHaveTextContent(
      "M 10 20 V 50 h 60 c 70 70 70 70 70 70 S 80 80 80 80 Q 90 90 90 90 t 100 100 A 110 110 0 0 0 110 110"
    );
  });

  test("should convert command to absolute in context menu", async () => {
    const circle = screen.getByLabelText("Control point circle_2l_0 at 40, 60");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    const setAbsolute = screen.getByRole("menuitem", {
      name: /set absolute/i,
    });

    fireEvent.click(setAbsolute);

    expect(textarea).toHaveTextContent(
      "M 10 20 L 40 60 V 50 h 60 c 70 70 70 70 70 70 S 80 80 80 80 Q 90 90 90 90 t 100 100 A 110 110 0 0 0 110 110"
    );
  });

  test("should convert command to relative in context menu", async () => {
    const circle = screen.getByLabelText("Control point circle_1M_0 at 10, 20");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    const setRelative = screen.getByRole("menuitem", {
      name: /set relative/i,
    });

    fireEvent.click(setRelative);

    expect(textarea).toHaveTextContent(
      "m 10 20 l 30 40 V 50 h 60 c 70 70 70 70 70 70 S 80 80 80 80 Q 90 90 90 90 t 100 100 A 110 110 0 0 0 110 110"
    );
  });

  test("should create command in context menu", async () => {
    let circle = screen.getByLabelText("Control point circle_1M_0 at 10, 20");
    let textarea = screen.getAllByRole("textbox")[0];

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    let insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const quadraticCurveOption = screen.getByRole("menuitem", {
      name: "Q Quadratic curve to",
    });

    fireEvent.click(quadraticCurveOption);

    expect(textarea).toHaveTextContent(
      "M 10 20 Q 50 50 50 50 l 30 40 V 50 h 60 c 70 70 70 70 70 70 S 80 80 80 80 Q 90 90 90 90 t 100 100 A 110 110 0 0 0 110 110"
    );

    circle = screen.getByLabelText("Control point circle_1M_0 at 10, 20");

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const lineToOption = screen.getByRole("menuitem", {
      name: "L Line to",
    });

    fireEvent.click(lineToOption);

    expect(textarea).toHaveTextContent(
      "M 10 20 L 50 50 Q 50 50 50 50 l 30 40 V 50 h 60 c 70 70 70 70 70 70 S 80 80 80 80 Q 90 90 90 90 t 100 100 A 110 110 0 0 0 110 110"
    );
  });
});
