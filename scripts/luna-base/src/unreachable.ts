export function unreachable(msg: string = "Unreachable"): never {
  throw new Error(msg);
}
