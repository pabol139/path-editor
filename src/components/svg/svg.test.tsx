import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Svg from "./svg";
import { createCommandObject } from "@/utils/test-utils";
import { usePathObject } from "@/context/path-context";
import { useEffect } from "react";
import { PathProvider } from "@/context/path-provider";
import PathInput from "../path/path-input";

const mockUpdateViewbox = jest.fn();
const mockSetSvgDimensions = jest.fn();

const defaultProps = {
  svgDimensions: { width: 100, height: 100 },
  viewbox: {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
  },
  setSvgDimensions: mockSetSvgDimensions,
  updateViewbox: mockUpdateViewbox,
};

const testCommands = [
  createCommandObject(1, "M", [10, 20]),
  createCommandObject(2, "C", [10, 20, 10, 20, 10, 20]),
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

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PathProvider>
      <TestSetup commands={testCommands} />
      <PathInput {...mockedPathInputProps}></PathInput>
      {children}
    </PathProvider>
  );
};

describe("svg element", () => {
  test("renders svg, path, points, lines", async () => {
    render(<Svg {...defaultProps}></Svg>, { wrapper });

    const container = screen.getByRole("application");

    // Svg element
    expect(screen.getByRole("application")).toBeInTheDocument();

    // Path element
    expect(screen.getAllByRole("img")[1]).toBeInTheDocument();

    // lines
    expect(
      screen.queryAllByRole("presentation", {
        hidden: true, // This includes aria-hidden elements
      })
    ).toHaveLength(2);

    // Control points
    await waitFor(() => {
      expect(container?.querySelectorAll('circle[role="button"]')).toHaveLength(
        4
      );
    });
  });

  test("should not render points, lines and decorative lines", () => {
    render(<Svg showControlElements={false} {...defaultProps}></Svg>, {
      wrapper,
    });
    expect(
      screen.queryAllByRole("presentation", {
        hidden: true, // This includes aria-hidden elements
      })
    ).toHaveLength(0);
  });
});
