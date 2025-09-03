export const createCommandObject = (
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
  points: [],
  prevPoint: {
    x: 0,
    y: 0,
  },
  ...overrides,
});
