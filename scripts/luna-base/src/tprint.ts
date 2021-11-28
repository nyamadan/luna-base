import { inspect } from "./lib/inspect/inspect";

export function tprint(this: void, ...args: any[]) {
  for (const v of args) {
    print(inspect(v));
  }
}
