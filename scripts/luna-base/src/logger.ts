import * as logging from "./lib/lualogging/logging";
import type { Logger, Level } from "./lib/lualogging/logging";
import { inspect } from "./lib/inspect/inspect";

export const logger = (
  (logging as any)["new"] as (
    this: void,
    f: (this: Logger, level: Level, message: string) => boolean
  ) => Logger
)(function (level, message) {
  switch (type(message)) {
    case "table":
    case "function": {
      print(`[${level}] ${inspect(message)}`);
      break;
    }
    default: {
      print(`[${level}] ${message}`);
      break;
    }
  }
  return true;
});
