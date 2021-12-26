import { inspect } from "./lib/inspect/inspect";

export function safeUnreachable(x: never): never {
  throw new Error(`Unreachable Error: ${inspect(x)}`);
}
