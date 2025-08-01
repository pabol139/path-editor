import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createCommandObject } from "@/utils/test-utils";
import Commands from "./commands";

const mockUpdatePath = jest.fn();
const mockStore = jest.fn();

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

  test("should render commands list and each command", async () => {
    render(<Commands></Commands>);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
