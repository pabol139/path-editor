import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Sidebar from "./sidebar";
import { createCommandObject } from "@/utils/test-utils";

const mockUpdatePath = jest.fn();
const mockStore = jest.fn();

const defaultProps = {
  svgDimensions: { width: 100, height: 100 },
  viewbox: {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  },
  setSvgDimensions: jest.fn(),
  updateViewbox: jest.fn(),
  open: true,
  setOpen: jest.fn(),
};

jest.mock("@/context/path-context", () => ({
  usePathObject: () => ({
    pathObject: {
      displayPath: "M 10 20 C 10 10 10 10",
      path: "M 10 20 C 10 10 10 10",
      commands: [
        createCommandObject(1, "M", [10, 10]),
        createCommandObject(2, "C", [10, 10, 10, 10]),
      ],
    },
    updatePath: mockUpdatePath,
    error: null,
    svgRef: { current: document.createElement("svg") },
    undoUtils: { store: mockStore },
  }),
}));

describe("commands", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render sidebar and opened", async () => {
    render(<Sidebar {...defaultProps}></Sidebar>);

    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  test("should render closed sidebar", async () => {
    render(<Sidebar {...defaultProps} open={false}></Sidebar>);

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  test("should open sidebar on click", async () => {
    render(<Sidebar {...defaultProps} open={false}></Sidebar>);

    const button = screen.getByLabelText("Open sidebar");
    fireEvent.click(button);

    // Assert that setOpen was called with the correct value
    expect(defaultProps.setOpen).toHaveBeenCalledWith(true);
  });

  test("should close sidebar on click", async () => {
    render(<Sidebar {...defaultProps} open={true}></Sidebar>);

    const button = screen.getByLabelText("Close sidebar");
    fireEvent.click(button);

    expect(defaultProps.setOpen).toHaveBeenCalledWith(false);
  });
});
