export type Command<T> = {
  id: string;
  letter: string;
  coordinates: T[];
  hovered: boolean;
  selected: boolean;
};

export type ParsePath<T> = Command<T>[];

export type PathObject = {
  path: string;
  commands: ParsePath<number>;
};
