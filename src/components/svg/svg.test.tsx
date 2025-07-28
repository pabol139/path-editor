import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Svg from "./svg";

const mockUpdatePath = jest.fn();
const mockUpdateViewbox = jest.fn();
const mockSetSvgDimensions = jest.fn();
const mockStore = jest.fn();

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

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("svg element", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders svg, path, points, lines and decorative lines", async () => {
    const { container } = render(<Svg {...defaultProps}></Svg>);

    // Svg element
    expect(screen.getByRole("application")).toBeInTheDocument();

    // Path element
    expect(screen.getByRole("img")).toBeInTheDocument();

    // lines and decorative lines
    expect(
      screen.queryAllByRole("presentation", {
        hidden: true, // This includes aria-hidden elements
      })
    ).toHaveLength(2);

    // Control points
    await waitFor(() => {
      expect(container.querySelectorAll('circle[role="button"]')).toHaveLength(
        4
      );
    });
  });

  test("should not render points, lines and decorative lines", () => {
    render(<Svg showControlElements={false} {...defaultProps}></Svg>);
    expect(
      screen.queryAllByRole("presentation", {
        hidden: true, // This includes aria-hidden elements
      })
    ).toHaveLength(0);
  });
});
