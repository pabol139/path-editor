import { LINE_COMMANDS } from "@/constants/path";
import { Command } from "@/types/Path";
import { Point } from "@/types/Point";
import { convertToRadians } from "./path";

interface CommandHandler {
  extractPoints: (command: Command<number>) => Point[];
  updateCoordinates: (
    coords: number[],
    x: number,
    y: number,
    pointIndex: number,
    currentPosition: { x: number; y: number },
    isRelative: boolean
  ) => number[];
  toAbsolute: (
    coords: number[],
    currentPosition: { x: number; y: number },
    isRelative: boolean
  ) => [string, number[]];
  toRelative: (
    coords: number[],
    currentPosition: { x: number; y: number },
    isRelative: boolean
  ) => [string, number[]];
  getAccumulatedPosition: (
    currentPosition: { x: number; y: number },
    coords: number[],
    isRelative: boolean
  ) => { x: number; y: number };
  validate?: (coords: number[]) => boolean;
  getEndPosition: (
    coordinates: number[],
    currentPosition: { x: number; y: number }
  ) => { x: number; y: number };
  getLastControlPoint?: (coordinates: number[]) => { x: number; y: number };
  translate: (
    coordinates: number[],
    values: { x: number; y: number }
  ) => number[];
  scale: (coordinates: number[], values: { x: number; y: number }) => number[];
  rotate: (
    coordinates: number[],
    origin: { x: number; y: number },
    angle: number
  ) => number[];
  create: (currentPosition: { x: number; y: number }) => Command<number>;
}

const generateBasePoint = (
  command: Command<number>,
  coordIndex: number,
  type?: string
) => {
  const { id, hovered, selected } = command;

  return {
    id: `circle_${id}_${coordIndex}${type ? `_${type}` : ""}`,
    id_command: id,
    coordinate_index: coordIndex,
    radius: "10",
    cx: "0",
    cy: "0",
    control: false,
    hovered: hovered,
    selected: selected,
  };
};

export const commandHandlers: Record<string, CommandHandler> = {
  [LINE_COMMANDS.MoveTo]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      if (isRelative) return [x - currentPosition.x, y - currentPosition.y];

      return [x, y];
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative)
        return [
          "M",
          [currentPosition.x + coords[0], currentPosition.y + coords[1]],
        ];

      return ["M", coords];
    }, // Already absolute
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) return ["m", absoluteCoords];
      return [
        "m",
        [
          absoluteCoords[0] - currentPosition.x,
          absoluteCoords[1] - currentPosition.y,
        ],
      ];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative)
        return {
          x: coords[0] + currentPosition.x,
          y: coords[1] + currentPosition.y,
        };

      return {
        x: coords[0],
        y: coords[1],
      };
    },
    getEndPosition: (coords) => ({ x: coords[0], y: coords[1] }),
    translate: (coords, values) => [coords[0] + values.x, coords[1] + values.y],
    scale: (coords, values) => [coords[0] * values.x, coords[1] * values.y],
    rotate: (coords, origin, angle) => {
      const translatedX = coords[0] - origin.x;
      const translatedY = coords[1] - origin.y;

      const radians = convertToRadians(angle);

      const rotatedX =
        translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
      const rotatedY =
        translatedX * Math.sin(radians) - translatedY * Math.cos(radians);

      const finalX = rotatedX + origin.x;
      const finalY = rotatedY + origin.y;

      return [finalX, finalY];
    },
    create: (currentPosition) => ({
      id: String(String(Math.random())),
      letter: LINE_COMMANDS.MoveTo,
      coordinates: [currentPosition.x, currentPosition.y],
      hovered: false,
      selected: true,
    }),
  },

  [LINE_COMMANDS.LineTo]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      if (isRelative) return [x - currentPosition.x, y - currentPosition.y];

      return [x, y];
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative)
        return [
          "L",
          [currentPosition.x + coords[0], currentPosition.y + coords[1]],
        ];

      return ["L", coords];
    }, // Already absolute
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) return ["l", absoluteCoords];

      return [
        "l",
        [
          absoluteCoords[0] - currentPosition.x,
          absoluteCoords[1] - currentPosition.y,
        ],
      ];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative)
        return {
          x: coords[0] + currentPosition.x,
          y: coords[1] + currentPosition.y,
        };

      return {
        x: coords[0],
        y: coords[1],
      };
    },
    getEndPosition: (coords) => ({ x: coords[0], y: coords[1] }),
    translate: (coords, values) => [coords[0] + values.x, coords[1] + values.y],
    scale: (coords, values) => [coords[0] * values.x, coords[1] * values.y],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.LineTo,
      coordinates: [currentPosition.x, currentPosition.y],
      hovered: false,
      selected: true,
    }),
  },
  [LINE_COMMANDS.Horizontal]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      if (isRelative) return [x - currentPosition.x];

      return [x];
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative) return ["H", [currentPosition.x + coords[0]]];
      return ["H", coords];
    }, // Already absolute
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) return ["h", absoluteCoords];
      return ["h", [absoluteCoords[0] - currentPosition.x]];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative)
        return {
          x: coords[0] + currentPosition.x,
          y: currentPosition.y,
        };

      return {
        x: coords[0],
        y: currentPosition.y,
      };
    },
    getEndPosition: (coords, currentPosition) => ({
      x: coords[0],
      y: currentPosition.y,
    }),
    translate: (coords, values) => [coords[0] + values.x, coords[1]],
    scale: (coords, values) => [coords[0] * values.x, coords[1]],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.Horizontal,
      coordinates: [currentPosition.x],
      hovered: false,
      selected: true,
    }),
  },

  [LINE_COMMANDS.Vertical]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      if (isRelative) return [y - currentPosition.y];

      return [y];
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative) return ["V", [currentPosition.y + coords[0]]];

      return ["V", coords];
    }, // Already absolute
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) return ["v", absoluteCoords];

      return ["v", [absoluteCoords[0] - currentPosition.y]];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative)
        return {
          x: currentPosition.x,
          y: coords[0] + currentPosition.y,
        };

      return {
        x: currentPosition.x,
        y: coords[0],
      };
    },
    getEndPosition: (coords, currentPosition) => ({
      x: currentPosition.x,
      y: coords[1],
    }),
    translate: (coords, values) => [coords[0], coords[1] + values.y],
    scale: (coords, values) => [coords[0], coords[1] * values.y],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.Vertical,
      coordinates: [currentPosition.y],
      hovered: false,
      selected: true,
    }),
  },

  [LINE_COMMANDS.QuadraticCurve]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
        control: true,
      },
      {
        ...generateBasePoint(command, 2),
        cx: String(command.coordinates[2]),
        cy: String(command.coordinates[3]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      const newCoords = [...coords];

      if (isRelative) {
        newCoords[pointIndex] = x - currentPosition.x;
        newCoords[pointIndex + 1] = y - currentPosition.y;
        return newCoords;
      }

      newCoords[pointIndex] = x;
      newCoords[pointIndex + 1] = y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative)
        return [
          "Q",
          [
            coords[0] + currentPosition.x,
            coords[1] + currentPosition.y,
            coords[2] + currentPosition.x,
            coords[3] + currentPosition.y,
          ],
        ];

      return ["Q", coords];
    }, // Already absolute
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) return ["q", absoluteCoords];

      return [
        "q",
        [
          absoluteCoords[0] - currentPosition.x,
          absoluteCoords[1] - currentPosition.y,
          absoluteCoords[2] - currentPosition.x,
          absoluteCoords[3] - currentPosition.y,
        ],
      ];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative)
        return {
          x: coords[2] + currentPosition.x,
          y: coords[3] + currentPosition.y,
        };

      return {
        x: coords[2],
        y: coords[3],
      };
    },
    getEndPosition: (coords) => ({ x: coords[2], y: coords[3] }),
    getLastControlPoint: (coords) => ({ x: coords[0], y: coords[1] }),
    translate: (coords, values) => [
      coords[0] + values.x,
      coords[1] + values.y,
      coords[2] + values.x,
      coords[3] + values.y,
    ],
    scale: (coords, values) => [
      coords[0] * values.x,
      coords[1] * values.y,
      coords[2] * values.x,
      coords[3] * values.y,
    ],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.QuadraticCurve,
      coordinates: [
        currentPosition.x,
        currentPosition.y,
        currentPosition.x,
        currentPosition.y,
      ],
      hovered: false,
      selected: true,
    }),
  },
  [LINE_COMMANDS.SmoothQuadraticCurve]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      if (isRelative) return [x - currentPosition.x, y - currentPosition.y];

      return [x, y];
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative)
        return [
          "T",
          [currentPosition.x + coords[0], currentPosition.y + coords[1]],
        ];
      return ["T", coords];
    }, // Already absolute
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) return ["t", absoluteCoords];
      return [
        "t",
        [
          absoluteCoords[0] - currentPosition.x,
          absoluteCoords[1] - currentPosition.y,
        ],
      ];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative)
        return {
          x: coords[0] + currentPosition.x,
          y: coords[1] + currentPosition.y,
        };

      return {
        x: coords[0],
        y: coords[1],
      };
    },
    getEndPosition: (coords) => ({ x: coords[0], y: coords[1] }),
    translate: (coords, values) => [coords[0] + values.x, coords[1] + values.y],
    scale: (coords, values) => [coords[0] * values.x, coords[1] * values.y],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.SmoothQuadraticCurve,
      coordinates: [currentPosition.x, currentPosition.y],
      hovered: false,
      selected: true,
    }),
  },
  [LINE_COMMANDS.Curve]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
        control: true,
      },
      {
        ...generateBasePoint(command, 2),
        cx: String(command.coordinates[2]),
        cy: String(command.coordinates[3]),
        control: true,
      },
      {
        ...generateBasePoint(command, 4),
        cx: String(command.coordinates[4]),
        cy: String(command.coordinates[5]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      const newCoords = [...coords];
      if (isRelative) {
        // convert new absolute (x,y) into relative deltas
        newCoords[pointIndex] = x - currentPosition.x;
        newCoords[pointIndex + 1] = y - currentPosition.y;
      } else {
        newCoords[pointIndex] = x;
        newCoords[pointIndex + 1] = y;
      }
      return newCoords;
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative) {
        // coords are relative deltas; convert to absolute
        return [
          "C",
          [
            coords[0] + currentPosition.x,
            coords[1] + currentPosition.y,
            coords[2] + currentPosition.x,
            coords[3] + currentPosition.y,
            coords[4] + currentPosition.x,
            coords[5] + currentPosition.y,
          ],
        ];
      }
      return ["C", coords];
    },
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) {
        // already relative representation expected by caller
        return ["c", absoluteCoords];
      }
      // subtract currentPosition to get relative deltas
      return [
        "c",
        absoluteCoords.map((coord, index) =>
          index % 2 === 0
            ? coord - currentPosition.x
            : coord - currentPosition.y
        ),
      ];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative) {
        // coords are relative deltas
        return {
          x: coords[4] + currentPosition.x,
          y: coords[5] + currentPosition.y,
        };
      }
      return {
        x: coords[4],
        y: coords[5],
      };
    },
    getEndPosition: (coords) => ({ x: coords[4], y: coords[5] }),
    getLastControlPoint: (coords) => ({ x: coords[2], y: coords[3] }),
    translate: (coords, values) => [
      coords[0] + values.x,
      coords[1] + values.y,
      coords[2] + values.x,
      coords[3] + values.y,
      coords[4] + values.x,
      coords[5] + values.y,
    ],
    scale: (coords, values) => [
      coords[0] * values.x,
      coords[1] * values.y,
      coords[2] * values.x,
      coords[3] * values.y,
      coords[4] * values.x,
      coords[5] * values.y,
    ],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.Curve,
      coordinates: [
        currentPosition.x,
        currentPosition.y,
        currentPosition.x + currentPosition.x * 0.1,
        currentPosition.y + currentPosition.y * 0.1,
        currentPosition.x + currentPosition.x * 0.2,
        currentPosition.y + currentPosition.y * 0.2,
      ],
      hovered: false,
      selected: true,
    }),
  },
  [LINE_COMMANDS.SmoothCurve]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
        control: true,
      },
      {
        ...generateBasePoint(command, 2),
        cx: String(command.coordinates[2]),
        cy: String(command.coordinates[3]),
        control: true,
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      const newCoords = [...coords];
      if (isRelative) {
        // convert new absolute (x,y) into relative deltas
        newCoords[pointIndex] = x - currentPosition.x;
        newCoords[pointIndex + 1] = y - currentPosition.y;
      } else {
        newCoords[pointIndex] = x;
        newCoords[pointIndex + 1] = y;
      }
      return newCoords;
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative) {
        // coords are relative [x2, y2, x, y]
        return [
          "S",
          [
            coords[0] + currentPosition.x,
            coords[1] + currentPosition.y,
            coords[2] + currentPosition.x,
            coords[3] + currentPosition.y,
          ],
        ];
      }
      return ["S", coords];
    },
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) {
        return ["s", absoluteCoords];
      }
      // subtract currentPosition to get relative deltas
      return [
        "s",
        [
          absoluteCoords[0] - currentPosition.x,
          absoluteCoords[1] - currentPosition.y,
          absoluteCoords[2] - currentPosition.x,
          absoluteCoords[3] - currentPosition.y,
        ],
      ];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative) {
        return {
          x: coords[2] + currentPosition.x,
          y: coords[3] + currentPosition.y,
        };
      }
      return {
        x: coords[2],
        y: coords[3],
      };
    },
    getEndPosition: (coords) => ({ x: coords[2], y: coords[3] }),
    getLastControlPoint: (coords) => ({ x: coords[0], y: coords[1] }),
    translate: (coords, values) => [
      coords[0] + values.x,
      coords[1] + values.y,
      coords[2] + values.x,
      coords[3] + values.y,
    ],
    scale: (coords, values) => [
      coords[0] * values.x,
      coords[1] * values.y,
      coords[2] * values.x,
      coords[3] * values.y,
    ],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.SmoothCurve,
      coordinates: [
        currentPosition.x,
        currentPosition.y,
        currentPosition.x + currentPosition.x * 0.1,
        currentPosition.y + currentPosition.y * 0.1,
      ],
      hovered: false,
      selected: true,
    }),
  },
  [LINE_COMMANDS.Arc]: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 5),
        cx: String(command.coordinates[5]),
        cy: String(command.coordinates[6]),
      },
    ],
    updateCoordinates: (
      coords,
      x,
      y,
      pointIndex,
      currentPosition,
      isRelative
    ) => {
      const newCoords = [...coords];
      if (isRelative) {
        newCoords[pointIndex] = x - currentPosition.x;
        newCoords[pointIndex + 1] = y - currentPosition.y;
      } else {
        newCoords[pointIndex] = x;
        newCoords[pointIndex + 1] = y;
      }
      return newCoords;
    },
    toAbsolute: (coords, currentPosition, isRelative) => {
      if (isRelative) {
        // coords: [rx, ry, xAxisRot, largeArcFlag, sweepFlag, dx, dy]
        return [
          "A",
          [
            coords[0],
            coords[1],
            coords[2],
            coords[3],
            coords[4],
            coords[5] + currentPosition.x,
            coords[6] + currentPosition.y,
          ],
        ];
      }
      return ["A", coords];
    },
    toRelative: (absoluteCoords, currentPosition, isRelative) => {
      if (isRelative) {
        return ["a", absoluteCoords];
      }
      // keep flags and radii, subtract position for endpoint
      return [
        "a",
        [
          absoluteCoords[0],
          absoluteCoords[1],
          absoluteCoords[2],
          absoluteCoords[3],
          absoluteCoords[4],
          absoluteCoords[5] - currentPosition.x,
          absoluteCoords[6] - currentPosition.y,
        ],
      ];
    },
    getAccumulatedPosition: (currentPosition, coords, isRelative) => {
      if (isRelative) {
        return {
          x: coords[5] + currentPosition.x,
          y: coords[6] + currentPosition.y,
        };
      }
      return {
        x: coords[5],
        y: coords[6],
      };
    },
    getEndPosition: (coords) => ({ x: coords[5], y: coords[6] }),
    translate: (coords, values) => [
      coords[0],
      coords[1],
      coords[2],
      coords[3],
      coords[4],
      coords[5] + values.x,
      coords[6] + values.y,
    ],
    scale: (coords, values) => [
      coords[0] * values.x,
      coords[1] * values.y,
      coords[2],
      coords[3],
      coords[4],
      coords[5] * values.x,
      coords[6] * values.y,
    ],
    create: (currentPosition) => ({
      id: String(Math.random()),
      letter: LINE_COMMANDS.Arc,
      coordinates: [1, 1, 0, 0, 0, currentPosition.x, currentPosition.y],
      hovered: false,
      selected: true,
    }),
  },
};
