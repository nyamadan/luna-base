/** @noSelfInFile */
/** @noResolution */

declare module "luna-base-utils" {
  export function isEmscripten(): boolean;
  export function isApple(): boolean;
  export function isWindows(): boolean;
  export function isLinux(): boolean;

  export function setErrorLogger(logger: (msg: string) => void): void;
}
