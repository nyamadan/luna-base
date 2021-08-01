export type Quat2 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];
export type ReadonlyQuat2 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export type Mat2d = [number, number, number, number, number, number];
export type ReadonlyMat2d = readonly [
  number,
  number,
  number,
  number,
  number,
  number
];

export type Vec2 = [number, number];
export type ReadonlyVec2 = readonly [number, number];

export function hypot(...args: number[]): number {
  return args.reduce((accum, x) => x * x + accum, 0);
}

export const EPSILON = 0.000001;
