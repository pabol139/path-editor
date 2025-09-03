import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { onPointerDownCommand } from "@/utils/path";
import { createCommandObject } from "@/utils/test-utils";
import Command from "./command";
import { usePathObject } from "@/context/path-context";
import { useEffect } from "react";
import { PathProvider } from "@/context/path-provider";
import PathInput from "../path/path-input";

const mockedProps = {
  id: "2C",
  letter: "C",
  coordinates: "10,10,10,10,10,10",
  selected: false,
  hovered: false,
  isFirst: false,
  handleEnter: jest.fn(),
  handleLeave: jest.fn(),
  handleDown: jest.fn(),
  handleInput: jest.fn(),
  handleClickCommandLetter: jest.fn(),
};

const testCommands = [
  createCommandObject(1, "M", [10, 20]),
  createCommandObject(2, "C", [10, 10, 10, 10, 10, 10]),
];

const TestSetup = ({ commands }: { commands: any[] }) => {
  const { updateCommands } = usePathObject();

  useEffect(() => {
    updateCommands(commands);
  }, []);

  return null;
};

const mockedPathInputProps = {
  updateViewbox: jest.fn(),
  setSvgDimensions: jest.fn(),
};
const mockHandleInput = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PathProvider>
      <TestSetup commands={testCommands} />
      <PathInput {...mockedPathInputProps}></PathInput>
      {children}
    </PathProvider>
  );
};

describe("commands", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Command {...mockedProps} handleInput={mockHandleInput} />, {
      wrapper,
    });
  });

  test("should render command", async () => {
    waitFor(() => {
      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });
  });

  test("should call handle down on focus", async () => {
    const command = screen.getByRole("listitem");
    fireEvent.focus(command);

    expect(mockedProps.handleDown).toHaveBeenCalled();
  });

  test("should select command using real selection logic", () => {
    cleanup();

    const initialCommands = [
      createCommandObject(1, "M", [10, 10]),
      createCommandObject(2, "C", [10, 10, 10, 10, 10, 10], {
        selected: false,
      }),
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

    render(<Command {...mockedProps} handleDown={handleDown} />, {
      wrapper,
    });

    // Click the command
    fireEvent.click(screen.getByRole("listitem"));

    // Verify the update function was called
    expect(mockUpdateCommands).toHaveBeenCalled();

    // Check that the command would be selected in the updated state
    const selectedCommand = currentCommands.find((cmd) => cmd.id === "2C");
    expect(selectedCommand?.selected).toBe(true);
  });

  test("should handle comma as decimal separator", () => {
    const xInput = screen.getAllByDisplayValue("10")[0];

    // Type with comma (European decimal separator)
    fireEvent.change(xInput, { target: { value: "10,5" } });

    // Should convert comma to dot and parse as 10.5
    expect(mockHandleInput).toHaveBeenCalledWith("2C", 0, 10.5);
  });

  test("should not call handleInput when value hasn't actually changed", () => {
    const xInput = screen.getAllByDisplayValue("10")[0];

    // Change to same value
    fireEvent.change(xInput, { target: { value: "10" } });

    // Should not call handleInput since value is the same
    expect(mockHandleInput).not.toHaveBeenCalled();
  });
});
