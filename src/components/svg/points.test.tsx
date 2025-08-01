import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Svg from "./svg";
import { useEffect } from "react";
import { PathProvider } from "@/context/path-provider";
import PathInput from "../path/path-input";
import { usePathObject } from "@/context/path-context";
import { createCommandObject } from "@/utils/test-utils";

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

describe("points", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Svg {...defaultProps}></Svg>, { wrapper });
  });

  test("should open context menu on circle right click", async () => {
    const circle = screen.getByLabelText("Control point circle_2m_0 at 20, 40");

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("should delete command in context menu", async () => {
    const circle = screen.getByLabelText("Control point circle_2m_0 at 20, 40");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    const deleteButton = screen.getByRole("menuitem", {
      name: /delete/i,
    });

    fireEvent.click(deleteButton);

    expect(textarea).toHaveTextContent(
      "M 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );
  });

  test("should convert command to absolute in context menu", async () => {
    const circle = screen.getByLabelText("Control point circle_2m_0 at 20, 40");
    const textarea = screen.getAllByRole("textbox")[0];

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    const setAbsolute = screen.getByRole("menuitem", {
      name: /set absolute/i,
    });

    fireEvent.click(setAbsolute);

    expect(textarea).toHaveTextContent(
      "M 10 20 M 20 40 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
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
      "m 10 20 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
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
      "M 10 20 Q 50 50 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );

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
      "M 10 20 L 50 50 Q 50 50 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const verticalLineTo = screen.getByRole("menuitem", {
      name: "V Vertical line to",
    });

    fireEvent.click(verticalLineTo);

    expect(textarea).toHaveTextContent(
      "M 10 20 V 50 L 50 50 Q 50 50 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const horizontalLineTo = screen.getByRole("menuitem", {
      name: "H Horizontal line to",
    });

    fireEvent.click(horizontalLineTo);

    expect(textarea).toHaveTextContent(
      "M 10 20 H 50 V 50 L 50 50 Q 50 50 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );
    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const curveTo = screen.getByRole("menuitem", {
      name: "C Curve to",
    });

    fireEvent.click(curveTo);

    expect(textarea).toHaveTextContent(
      "M 10 20 C 50 50 55 55 60 60 H 50 V 50 L 50 50 Q 50 50 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );

    let curveCircle = screen.getByLabelText(
      "Control point circle_22C_4 at 60, 60"
    );
    fireEvent.pointerDown(curveCircle);
    fireEvent.contextMenu(curveCircle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const smoothCurveTo = screen.getByRole("menuitem", {
      name: "S Smooth curve to",
    });

    fireEvent.click(smoothCurveTo);

    expect(textarea).toHaveTextContent(
      "M 10 20 C 50 50 55 55 60 60 S 50 50 55 55 H 50 V 50 L 50 50 Q 50 50 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );

    let quadraticCurveToCircle = screen.getByLabelText(
      "Control point circle_18Q_0 at 50, 50"
    );

    fireEvent.pointerDown(quadraticCurveToCircle);
    fireEvent.contextMenu(quadraticCurveToCircle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const smoothQuadraticCurveTo = screen.getByRole("menuitem", {
      name: "T Smooth quadratic curve to",
    });

    fireEvent.click(smoothQuadraticCurveTo);

    expect(textarea).toHaveTextContent(
      "M 10 20 C 50 50 55 55 60 60 S 50 50 55 55 H 50 V 50 L 50 50 Q 50 50 50 50 T 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const arcTo = screen.getByRole("menuitem", {
      name: "A Arc to",
    });

    fireEvent.click(arcTo);

    expect(textarea).toHaveTextContent(
      "M 10 20 A 1 1 0 0 0 50 50 C 50 50 55 55 60 60 S 50 50 55 55 H 50 V 50 L 50 50 Q 50 50 50 50 T 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );

    fireEvent.pointerDown(circle);
    fireEvent.contextMenu(circle);

    insertAfterOption = screen.getByRole("menuitem", {
      name: /insert after/i,
    });

    fireEvent.click(insertAfterOption);

    const closeTo = screen.getByRole("menuitem", {
      name: "Z Close path",
    });

    fireEvent.click(closeTo);

    expect(textarea).toHaveTextContent(
      "M 10 20 Z A 1 1 0 0 0 50 50 C 50 50 55 55 60 60 S 50 50 55 55 H 50 V 50 L 50 50 Q 50 50 50 50 T 50 50 m 10 20 L 30 40 l 30 40 V 50 v 50 H 60 h 60 C 70.1 70 70 70 70 70 c 70.1 70 70 70 70 70 S 80 -80 80 80 s 80 -80 80 80 Q 90 90 90 90 q 90 90 90 90 T 100 100 t 100 100 A 110 110 0 0 0 110 110 a 110 110 0 0 0 110 110"
    );
  });
});
