export function Circle({
  radius,
  cx,
  cy,
  fill,
}: {
  radius: string;
  cx: string;
  cy: string;
  fill: string;
}) {
  return <circle r={radius} cx={cx} cy={cy} fill={fill}></circle>;
}
