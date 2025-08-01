import {
  convertCommandsToPath,
  formatCommands,
  parsePath,
  scale,
  translate,
} from "./path";
import { createCommandObject } from "./test-utils";

beforeAll(() => {
  jest.spyOn(crypto, "randomUUID").mockReturnValue("mock-id-id-id-id");
});

afterAll(() => {
  jest.spyOn(crypto, "randomUUID").mockRestore();
});

describe("parsePath", () => {
  test("should parse move to", () => {
    expect(parsePath("m 10 20")).toEqual([
      createCommandObject(0, "m", [10, 20]),
    ]);
  });

  test("should parse multiple commands", () => {
    expect(parsePath("m 10 20 l 10 -10 v 10 ")).toEqual([
      createCommandObject(0, "m", [10, 20]),
      createCommandObject(1, "l", [10, -10]),
      createCommandObject(2, "v", [10]),
    ]);
  });

  test("should parse whitespace variation", () => {
    expect(parsePath("m 10     20l 10-10 ")).toEqual([
      createCommandObject(0, "m", [10, 20]),
      createCommandObject(1, "l", [10, -10]),
    ]);
  });

  test("should throw missing move to", () => {
    expect(() => parsePath("l 10-10 ")).toThrow();
  });

  test("moveTo with multiple points", () => {
    expect(parsePath("m 10 10 20 20 30-30 z")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "l", [20, 20]),
      createCommandObject(2, "l", [30, -30]),
      createCommandObject(3, "z", []),
    ]);
  });

  test("should parse line to", () => {
    expect(parsePath("m 10 10 l 10.5 20.3")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "l", [10.5, 20.3]),
    ]);

    expect(parsePath("m 10 10 l 10.5 20.3 0 1")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "l", [10.5, 20.3]),
      createCommandObject(2, "l", [0, 1]),
    ]);

    expect(() => parsePath("m 10 10 l 10.5")).toThrow();
  });
  test("should parse horizontal to", () => {
    expect(parsePath("m 10 10 h 10.5")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "h", [10.5]),
    ]);

    expect(() => parsePath("m 10 10 h")).toThrow();
  });
  test("should parse vertical to", () => {
    expect(parsePath("m 10 10 v 10.5")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "v", [10.5]),
    ]);

    expect(() => parsePath("m 10 10 v")).toThrow();
  });

  test("should parse curve to", () => {
    expect(parsePath("m 10 10 c 10.5 20.3 0 1 30 30")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "c", [10.5, 20.3, 0, 1, 30, 30]),
    ]);

    expect(
      parsePath("m 10 10 c 10.5 20.3 0 1 30 30 20.5 10.3 23 14 3 7")
    ).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "c", [10.5, 20.3, 0, 1, 30, 30]),
      createCommandObject(2, "c", [20.5, 10.3, 23, 14, 3, 7]),
    ]);

    expect(() => parsePath("m 10 10 c 10.5 20.3")).toThrow();
  });

  test("should parse smooth curve to", () => {
    expect(parsePath("m 10 10 s 10.5 20.3 10.5 10.5")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "s", [10.5, 20.3, 10.5, 10.5]),
    ]);

    expect(() => parsePath("m 10 10 s 10.5 20.3")).toThrow();
  });

  test("should parse quadratic curve to", () => {
    expect(parsePath("m 10 10 q 10.5 20.3 10.5 1")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "q", [10.5, 20.3, 10.5, 1]),
    ]);

    expect(() => parsePath("m 10 10 q 10.5 20.3 10.5")).toThrow();
  });

  test("should parse smooth quadratic curve to", () => {
    expect(parsePath("m 10 10 t 10.5 20.3")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "t", [10.5, 20.3]),
    ]);

    expect(() => parsePath("m 10 10 t 10.5")).toThrow();
  });

  test("should parse arc to", () => {
    expect(parsePath("m 10 10 a 14 14, 0 1 1 51, 15")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "a", [14, 14, 0, 1, 1, 51, 15]),
    ]);

    expect(() => parsePath("m 10 10 a 14 14 0 1 1")).toThrow();
  });

  test("should parse close", () => {
    expect(parsePath("m 10 10 z")).toEqual([
      createCommandObject(0, "m", [10, 10]),
      createCommandObject(1, "z", []),
    ]);

    expect(() => parsePath("m 10 10 z 10")).toThrow();
  });
});

describe("formatCommands", () => {
  test("should format numbers to specified precision", () => {
    const commands = [createCommandObject(1, "m", [10.123, 20.12945])];
    const result = formatCommands(commands, 2);
    expect(result).toEqual([createCommandObject(1, "m", [10.12, 20.13])]);
  });

  test("should handle zero precision", () => {
    const commands = [createCommandObject(1, "m", [10.123, 20.12945])];
    const result = formatCommands(commands, 0);
    expect(result).toEqual([createCommandObject(1, "m", [10, 20])]);
  });

  test("should handle negative numbers", () => {
    const commands = [createCommandObject(1, "m", [10.12, -20.12])];
    const result = formatCommands(commands, 1);
    expect(result).toEqual([createCommandObject(1, "m", [10.1, -20.1])]);
  });
});

describe("transformations", () => {
  test("should translate commands", () => {
    const commands = [
      createCommandObject(1, "m", [10.1, 20.1]),
      createCommandObject(2, "l", [10.1, 10.1]),
      createCommandObject(3, "v", [1]),
      createCommandObject(4, "h", [-2.1]),
      createCommandObject(5, "c", [0, 1, 0, 1, 0, 1]),
      createCommandObject(6, "s", [0, 1, 0, 1]),
      createCommandObject(7, "q", [0, 1, 0, 1]),
      createCommandObject(8, "t", [0, 1]),
      createCommandObject(9, "a", [14, 14, 0, 1, 1, 51, 15]),
      createCommandObject(10, "z", []),
    ];

    expect(translate(commands, "1", "2")).toEqual([
      createCommandObject(1, "m", [11.1, 22.1]),
      createCommandObject(2, "l", [10.1, 10.1]),
      createCommandObject(3, "v", [1]),
      createCommandObject(4, "h", [-2.1]),
      createCommandObject(5, "c", [0, 1, 0, 1, 0, 1]),
      createCommandObject(6, "s", [0, 1, 0, 1]),
      createCommandObject(7, "q", [0, 1, 0, 1]),
      createCommandObject(8, "t", [0, 1]),
      createCommandObject(9, "a", [14, 14, 0, 1, 1, 51, 15]),
      createCommandObject(10, "z", []),
    ]);

    expect(translate(commands, "1", "")).toEqual(commands);
    expect(translate(commands, "", "1")).toEqual(commands);
  });

  test("should scale commands", () => {
    const commands = [
      createCommandObject(1, "m", [10.1, 20.1]),
      createCommandObject(2, "l", [10.1, 10.1]),
      createCommandObject(3, "v", [1]),
      createCommandObject(4, "h", [-2.1]),
      createCommandObject(5, "c", [0, 1, 0, 1, 0, 1]),
      createCommandObject(6, "s", [0, 1, 0, 1]),
      createCommandObject(7, "q", [0, 1, 0, 1]),
      createCommandObject(8, "t", [0, 1]),
      createCommandObject(9, "a", [14, 14, 0, 1, 1, 51, 15]),
      createCommandObject(10, "z", []),
    ];

    expect(scale(commands, "2", "2")).toEqual([
      createCommandObject(1, "m", [20.2, 40.2]),
      createCommandObject(2, "l", [20.2, 20.2]),
      createCommandObject(3, "v", [2]),
      createCommandObject(4, "h", [-4.2]),
      createCommandObject(5, "c", [0, 2, 0, 2, 0, 2]),
      createCommandObject(6, "s", [0, 2, 0, 2]),
      createCommandObject(7, "q", [0, 2, 0, 2]),
      createCommandObject(8, "t", [0, 2]),
      createCommandObject(9, "a", [28, 28, 0, 1, 1, 102, 30]),
      createCommandObject(10, "z", []),
    ]);

    expect(scale(commands, "1", "")).toEqual(commands);
    expect(scale(commands, "", "1")).toEqual(commands);
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
      "M 10.12 20.46 L 30.79 40.01 C 50.1 60.2 70.3 80.4 90.5 100.6"
    );
  });
  test("should handle complex paths with all command types", () => {
    const complexPath =
      "M 0 0 m 10 10 L 10 10 l 30.2 20.3 Q 90 90 90 90 q -20 20 3 3 T 10 10 t 20 20 C 20 30 49 30 10 20 c -40.2 40 50 50 60 60 S 20 20 20 20 s 10 10 10 10 A 30 50 0 0 1 162.52 162.42 a 40 50 1 1 1 150 150 Z";

    const parsed = parsePath(complexPath);
    const formatted = formatCommands(parsed, 1);
    const converted = convertCommandsToPath(formatted);

    expect(() => parsePath(converted)).not.toThrow();
    expect(converted).toBe(
      "M 0 0 m 10 10 L 10 10 l 30.2 20.3 Q 90 90 90 90 q -20 20 3 3 T 10 10 t 20 20 C 20 30 49 30 10 20 c -40.2 40 50 50 60 60 S 20 20 20 20 s 10 10 10 10 A 30 50 0 0 1 162.5 162.4 a 40 50 1 1 1 150 150 Z"
    );
  });
});
