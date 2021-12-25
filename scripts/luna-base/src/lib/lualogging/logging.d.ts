export const DEBUG = "DEBUG";
export const ERROR = "ERROR";
export const FATAL = "FATAL";
export const INFO = "INFO";
export const OFF = "OFF";
export const WARN = "WARN";

type Level =
  | typeof OFF
  | typeof DEBUG
  | typeof INFO
  | typeof WARN
  | typeof ERROR
  | typeof FATAL;

export interface Logger {
  setLevel(level: Level): void;
  log(level: Level, fmt: string, ...args: any[]): void;
  debug(fmt: string, ...args: any[]): void;
  info(fmt: string, ...args: any[]): void;
  warn(fmt: string, ...args: any[]): void;
  error(fmt: string, ...args: any[]): void;
  fatal(fmt: string, ...args: any[]): void;
}
