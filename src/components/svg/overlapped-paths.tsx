import type { OverlappedPath } from "@/utils/overlapped-paths";

export default function OverlappedPaths({
  linesWidth,
  overlappedPaths,
}: {
  linesWidth: string;
  overlappedPaths: OverlappedPath[];
}) {
  return (
    <>
      {overlappedPaths.map(({ color, overlappedPath }, index) => (
        <path
          role="presentation"
          aria-hidden="true"
          key={index}
          d={overlappedPath}
          stroke={color}
          fill="transparent"
          strokeWidth={linesWidth}
        ></path>
      ))}
    </>
  );
}
