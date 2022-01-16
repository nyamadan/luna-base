import { inspect } from "./lib/inspect/inspect";

type Level = "OFF" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
type LogMsg = (this: Logger, level: Level, message: string) => boolean;

interface Logger {
  setLevel(level: Level): void;
  log(level: Level, fmt: string, ...args: any[]): void;
  debug(fmt: string, ...args: any[]): void;
  info(fmt: string, ...args: any[]): void;
  warn(fmt: string, ...args: any[]): void;
  error(fmt: string, ...args: any[]): void;
  fatal(fmt: string, ...args: any[]): void;
}

interface Logging {
  new: (this: void, logMsg: LogMsg) => Logger;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logging: Logging = require("./lib/lualogging/logging");

export const logger = logging["new"](function (level, message) {
  print(`[${level}] ${message}`);
  return true;
});

export function dbg(this: void, x: any) {
  logger.debug(inspect(x));
}
