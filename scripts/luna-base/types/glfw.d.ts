/** @noSelfInFile */
/** @noResolution */
declare module "glfw" {
  export const FALSE: number;
  export const TRUE: number;
  export const VISIBLE: number;
  export const RESIZABLE: number;
  export const OPENGL_ES_API: number;
  export const CLIENT_API: number;
  export const CONTEXT_VERSION_MAJOR: number;
  export const CONTEXT_VERSION_MINOR: number;
  export const OPENGL_FORWARD_COMPAT: number;
  export const OPENGL_PROFILE: number;
  export const OPENGL_CORE_PROFILE: number;
  export const OPENGL_DEBUG_CONTEXT: number; 

  export function windowHint(hint: number, value: number): void;
  export function init(): void;
  export function start(args: {
    width: number;
    height: number;
    start: (this: void) => void;
    update: (this: void) => void;
  }): void;
  export function pollEvents(): void;
  export function setShouldWindowClose(value: number): void;
  export function destroyWindow(): void;
}
