import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Viewbox from "./viewbox";
import Wrapper from "./wrapper";

const defaultProps = {
  viewbox: {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  },
  updateViewbox: jest.fn(),
};

jest.mock("@/context/path-context", () => ({
  usePathObject: () => ({
    pathObject: {
      displayPath: "M 10 20 C 10 10 10 10",
      path: "M 10 20 C 10 10 10 10",
      commands: [],
    },
    svgRef: { current: document.createElement("svg") },
    undoUtils: {
      undoStack: [],
      redoStack: [],
      handleUndo: jest.fn(),
      handleRedo: jest.fn(),
    },
  }),
}));

describe("commands", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render viewbox inputs", async () => {
    render(<Viewbox {...defaultProps}></Viewbox>);
    const xInput = screen.getByLabelText(/x/i);
    const yInput = screen.getByLabelText(/y/i);
    const wInput = screen.getByLabelText(/w/i);
    const hInput = screen.getByLabelText(/h/i);

    expect(xInput).toHaveValue("0");
    expect(yInput).toHaveValue("0");
    expect(wInput).toHaveValue("1000");
    expect(hInput).toHaveValue("1000");
  });

  test("should change viewbox inputs", async () => {
    render(<Wrapper></Wrapper>);
    const xInput = screen.getAllByLabelText("x")[0];
    const yInput = screen.getAllByLabelText("y")[0];
    const wInput = screen.getAllByLabelText("w")[0];
    const hInput = screen.getAllByLabelText("h")[0];

    fireEvent.change(xInput, {
      target: { value: 10 },
    });
    fireEvent.change(yInput, {
      target: { value: 10 },
    });
    fireEvent.change(wInput, {
      target: { value: -10 },
    });
    fireEvent.change(hInput, {
      target: { value: -10 },
    });
    expect(xInput).toHaveValue("10");
    expect(yInput).toHaveValue("10");
    expect(wInput).toHaveValue("10");
    expect(hInput).toHaveValue("10");
  });
});
