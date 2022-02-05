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
  export const PRESS: number;
  export const RELEASE: number;
  export const REPEAT: number;
  export const MOD_SHIFT: number;
  export const MOD_CONTROL: number;
  export const MOD_ALT: number;
  export const MOD_SUPER: number;
  export const MOD_CAPS_LOCK: number;
  export const MOD_NUM_LOCK: number;

  export function windowHint(hint: number, value: number): void;

  export function getKeyEvents(): Array<{
    key: number;
    scancode: number;
    action: number;
    mods: number;
  }>;
  export function clearKeyEvents(): void;

  export function getMouseEvents(): Array<
    | {
        event: "button";
        button: number;
        action: number;
        mods: number;
      }
    | {
        event: "position";
        xpos: number;
        ypos: number;
      }
  >;
  export function clearMouseEvents(): void;

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
