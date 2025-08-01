import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Toolbar from "./toolbar";

const defaultProps = {
  viewbox: {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  },
  setSvgDimensions: jest.fn(),
  updateViewbox: jest.fn(),
  showControlElements: true,
  setShowControlElements: jest.fn(),
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

  test("should render toolbar", async () => {
    render(<Toolbar {...defaultProps}></Toolbar>);

    expect(screen.getAllByRole("toolbar")).toHaveLength(2);
  });
});
