import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { onPointerDownCommand } from "@/utils/path";
import { createCommandObject } from "@/utils/test-utils";
import Command from "./command";

const mockUpdatePath = jest.fn();
const mockStore = jest.fn();

const mockedProps = {
  id: "2C",
  letter: "C",
  coordinates: [10, 10, 10, 10],
  selected: false,
  hovered: false,
  isFirst: false,
  handleEnter: jest.fn(),
  handleLeave: jest.fn(),
  handleDown: jest.fn(),
  handleInput: jest.fn(),
  handleClickCommandLetter: jest.fn(),
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

  test("should render command", async () => {
    const { container } = render(<Command {...mockedProps}></Command>);
    waitFor(() => {
      expect(container.querySelector("listitem")).toBeInTheDocument();
    });
  });

  test("should call handle down on focus", async () => {
    render(<Command {...mockedProps}></Command>);
    const command = screen.getByRole("listitem");
    fireEvent.focus(command);

    expect(mockedProps.handleDown).toHaveBeenCalled();
  });

  test("should select command using real selection logic", () => {
    const initialCommands = [
      createCommandObject(1, "M", [10, 10]),
      createCommandObject(2, "C", [10, 10, 10, 10], { selected: false }),
    ];

    let currentCommands = [...initialCommands];
    const mockUpdateCommands = jest.fn((updater) => {
      if (typeof updater === "function") {
        currentCommands = updater(currentCommands);
      } else {
        currentCommands = updater;
      }
    });

    const handleDown = () => {
      onPointerDownCommand(currentCommands, mockUpdateCommands, "2C");
    };

    const { rerender } = render(
      <Command {...mockedProps} handleDown={handleDown} />
    );

    // Click the command
    fireEvent.click(screen.getByRole("listitem"));

    // Verify the update function was called
    expect(mockUpdateCommands).toHaveBeenCalled();

    // Check that the command would be selected in the updated state
    const selectedCommand = currentCommands.find((cmd) => cmd.id === "2C");
    expect(selectedCommand?.selected).toBe(true);

    // Re-render with the updated state
    rerender(
      <Command {...mockedProps} selected={true} handleDown={handleDown} />
    );

    expect(screen.getByRole("listitem")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("should handle comma as decimal separator", () => {
    const mockHandleInput = jest.fn();

    render(<Command {...mockedProps} handleInput={mockHandleInput} />);

    const xInput = screen.getAllByDisplayValue("10")[0];

    // Type with comma (European decimal separator)
    fireEvent.change(xInput, { target: { value: "10,5" } });

    // Should convert comma to dot and parse as 10.5
    expect(mockHandleInput).toHaveBeenCalledWith("2C", 0, 10.5);
  });

  test("should not call handleInput when value hasn't actually changed", () => {
    const mockHandleInput = jest.fn();

    render(<Command {...mockedProps} handleInput={mockHandleInput} />);

    const xInput = screen.getAllByDisplayValue("10")[0];

    // Change to same value
    fireEvent.change(xInput, { target: { value: "10" } });

    // Should not call handleInput since value is the same
    expect(mockHandleInput).not.toHaveBeenCalled();
  });
});
