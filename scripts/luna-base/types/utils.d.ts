/** @noSelfInFile */
/** @noResolution */

declare module "utils" {
  export function print_table(...args: any[]): void;
  export function isEmscripten(): boolean;
  export function isApple(): boolean;
  export function isWindows(): boolean;
  export function isLinux(): boolean;
}
