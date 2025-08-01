import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Path from "./path";

// Mock the PathContext
const mockUpdatePath = jest.fn();
const mockUpdateViewbox = jest.fn();
const mockSetSvgDimensions = jest.fn();

jest.mock("@/context/path-context", () => ({
  usePathObject: () => ({
    pathObject: {
      displayPath: "M 10 20 L 30 40",
      path: "M 10 20 L 30 40",
    },
    updatePath: mockUpdatePath,
    error: null,
    svgRef: { current: document.createElement("svg") },
  }),
}));

const defaultProps = {
  svgDimensions: { width: 100, height: 100 },
  updateViewbox: mockUpdateViewbox,
  setSvgDimensions: mockSetSvgDimensions,
};

describe("path input", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Path {...defaultProps}></Path>);
  });

  test("renders path textarea and copy button", () => {
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByLabelText("Copy path to clipboard")).toBeInTheDocument();
  });

  test("textarea should be filled with correct path", () => {
    expect(screen.getByRole("textbox")).toHaveValue("M 10 20 L 30 40");
  });

  test("calls updatePath when textarea value changes", () => {
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "M 0 0 L 50 50" } });

    expect(mockUpdatePath).toHaveBeenCalledWith("M 0 0 L 50 50");
  });

  test("copies path to clipboard when copy button is clicked", async () => {
    const copyButton = screen.getByLabelText("Copy path to clipboard");
    fireEvent.click(copyButton); // No act() needed

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "M 10 20 L 30 40"
    );

    // Wait for the async state update
    await waitFor(() => {
      expect(copyButton.querySelector(".lucide-check")).toBeInTheDocument();
    });
  });
});
