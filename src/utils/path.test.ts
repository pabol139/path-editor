import { convertCommandsToPath, formatCommands, parsePath } from "./path";

beforeAll(() => {
  jest.spyOn(crypto, "randomUUID").mockReturnValue("mock-id-id-id-id");
});

afterAll(() => {
  jest.spyOn(crypto, "randomUUID").mockRestore();
});

const createCommandObject = (
  letter: string,
  coordinates: number[],
  overrides = {}
) => ({
  id: expect.any(String),
  letter,
  coordinates,
  hovered: false,
  selected: false,
  ...overrides,
});

describe("parsePath", () => {
  test("should parse move to", () => {
    expect(parsePath("m 10 20")).toEqual([createCommandObject("m", [10, 20])]);
  });

  test("should parse multiple commands", () => {
    expect(parsePath("m 10 20 l 10 -10 v 10 ")).toEqual([
      createCommandObject("m", [10, 20]),
      createCommandObject("l", [10, -10]),
      createCommandObject("v", [10]),
    ]);
  });

  test("should parse whitespace variation", () => {
    expect(parsePath("m 10     20l 10-10 ")).toEqual([
      createCommandObject("m", [10, 20]),
      createCommandObject("l", [10, -10]),
    ]);
  });

  test("should throw missing move to", () => {
    expect(() => parsePath("l 10-10 ")).toThrow();
  });

  test("moveTo with multiple points", () => {
    expect(parsePath("m 10 10 20 20 30-30 z")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("l", [20, 20]),
      createCommandObject("l", [30, -30]),
      createCommandObject("z", []),
    ]);
  });

  test("should parse line to", () => {
    expect(parsePath("m 10 10 l 10.5 20.3")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("l", [10.5, 20.3]),
    ]);

    expect(parsePath("m 10 10 l 10.5 20.3 0 1")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("l", [10.5, 20.3]),
      createCommandObject("l", [0, 1]),
    ]);

    expect(() => parsePath("m 10 10 l 10.5")).toThrow();
  });
  test("should parse horizontal to", () => {
    expect(parsePath("m 10 10 h 10.5")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("h", [10.5]),
    ]);

    expect(() => parsePath("m 10 10 h")).toThrow();
  });
  test("should parse vertical to", () => {
    expect(parsePath("m 10 10 v 10.5")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("v", [10.5]),
    ]);

    expect(() => parsePath("m 10 10 v")).toThrow();
  });

  test("should parse curve to", () => {
    expect(parsePath("m 10 10 c 10.5 20.3 0 1 30 30")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("c", [10.5, 20.3, 0, 1, 30, 30]),
    ]);

    expect(
      parsePath("m 10 10 c 10.5 20.3 0 1 30 30 20.5 10.3 23 14 3 7")
    ).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("c", [10.5, 20.3, 0, 1, 30, 30]),
      createCommandObject("c", [20.5, 10.3, 23, 14, 3, 7]),
    ]);

    expect(() => parsePath("m 10 10 c 10.5 20.3")).toThrow();
  });

  test("should parse smooth curve to", () => {
    expect(parsePath("m 10 10 s 10.5 20.3 10.5 10.5")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("s", [10.5, 20.3, 10.5, 10.5]),
    ]);

    expect(() => parsePath("m 10 10 s 10.5 20.3")).toThrow();
  });

  test("should parse quadratic curve to", () => {
    expect(parsePath("m 10 10 q 10.5 20.3 10.5 1")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("q", [10.5, 20.3, 10.5, 1]),
    ]);

    expect(() => parsePath("m 10 10 q 10.5 20.3 10.5")).toThrow();
  });

  test("should parse smooth quadratic curve to", () => {
    expect(parsePath("m 10 10 t 10.5 20.3")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("t", [10.5, 20.3]),
    ]);

    expect(() => parsePath("m 10 10 t 10.5")).toThrow();
  });

  test("should parse close", () => {
    expect(parsePath("m 10 10 z")).toEqual([
      createCommandObject("m", [10, 10]),
      createCommandObject("z", []),
    ]);

    expect(() => parsePath("m 10 10 z 10")).toThrow();
  });
});

describe("formatCommands", () => {
  test("should format numbers to specified precision", () => {
    const commands = [createCommandObject("m", [10.123, 20.12945])];
    const result = formatCommands(commands, 2);
    expect(result).toEqual([createCommandObject("m", [10.12, 20.13])]);
  });

  test("should handle zero precision", () => {
    const commands = [createCommandObject("m", [10.123, 20.12945])];
    const result = formatCommands(commands, 0);
    expect(result).toEqual([createCommandObject("m", [10, 20])]);
  });

  test("should handle negative numbers", () => {
    const commands = [createCommandObject("m", [10.12, -20.12])];
    const result = formatCommands(commands, 1);
    expect(result).toEqual([createCommandObject("m", [10.1, -20.1])]);
  });
});

describe("Round-trip conversion", () => {
  test("should maintain data integrity through parse -> format -> convert cycle", () => {
    const originalPath =
      "M 10.123 20.456 L 30.789 40.012 C 50.1 60.2 70.3 80.4 90.5 100.6";

    // Parse -> Format -> Convert back
    const parsed = parsePath(originalPath);
    const formatted = formatCommands(parsed, 2);
    const converted = convertCommandsToPath(formatted);

    // Should be valid and parseable again
    expect(() => parsePath(converted)).not.toThrow();

    // Numbers should be properly formatted
    expect(converted).toBe(
      "M 10.12 20.46 L 30.79 40.01 C 50.10 60.20 70.30 80.40 90.50 100.60"
    );
  });
  test("should handle complex paths with all command types", () => {
    const complexPath =
      "M 0 0 L 10 10 Q 20 20 30 30 T 10 10 C 40 40 50 50 60 60 S 20 20 20 20 A 30 50 0 0 1 162.52 162.42 Z";

    const parsed = parsePath(complexPath);
    const formatted = formatCommands(parsed, 1);
    const converted = convertCommandsToPath(formatted);

    expect(() => parsePath(converted)).not.toThrow();
    expect(converted).toBe(
      "M 0 0 L 10 10 Q 20 20 30 30 T 10 10 C 40 40 50 50 60 60 S 20 20 20 20 A 30 50 0 0 1 162.50 162.40 Z"
    );
  });
});
