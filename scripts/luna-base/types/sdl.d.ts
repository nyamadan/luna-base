/** @noSelfInFile */
/** @noResolution */
declare module "sdl" {
  export function init(flags: number): number;
  export function pollEvent(): LuaMultiReturn<
    [
      number,
      {
        type: number;
        window: {
          event: number;
        };
        button: {
          button: number;
          clicks: number;
          state: number;
          timestamp: number;
          type: number;
          which: number;
          windowID: number;
          x: number;
          y: number;
        };
        motion: {
          state: number;
          timestamp: number;
          type: number;
          which: number;
          windowID: number;
          x: number;
          xrel: number;
          y: number;
          yrel: number;
        };
        wheel: {
          direction: number;
          preciseX: number;
          preciseY: number;
          timestamp: number;
          type: number;
          which: number;
          windowID: number;
          x: number;
          y: number;
        };
        key: {
          repeat: number;
          state: number;
          timestamp: number;
          type: number;
          windowID: number;
          keysym: {
            sym: number;
            mod: number;
            scancode: number;
          }
        }
      }
    ]
  >;
  export function setShouldWindowClose(x: boolean): void;
  export function setWindowPosition(x: number, y: number): void;
  export function GL_Set_Attribute(attr: number, value: number): number;
  export const SDL_INIT_VIDEO: number;
  export const SDL_INIT_EVENTS: number;
  export const SDL_WINDOWEVENT: number;
  export const SDL_WINDOWEVENT_CLOSE: number;
  export const SDL_GL_CONTEXT_PROFILE_MASK: number;
  export const SDL_GL_CONTEXT_PROFILE_CORE: number;
  export const SDL_GL_CONTEXT_PROFILE_ES: number;
  export const SDL_GL_CONTEXT_MAJOR_VERSION: number;
  export const SDL_GL_CONTEXT_MINOR_VERSION: number;
  export const SDL_GL_CONTEXT_FLAGS: number;
  export const SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG: number;
  export const SDL_WINDOW_OPENGL: number;
  export const SDL_WINDOW_SHOWN: number;
  export const SDL_WINDOW_HIDDEN: number;
  export const SDL_WINDOW_ALLOW_HIGHDPI: number;
  export const SDL_WINDOWPOS_CENTERED: number;
  export const SDL_KEYDOWN: number;
  export const SDL_KEYUP: number;
  export const SDL_TEXTEDITING: number;
  export const SDL_TEXTINPUT: number;
  export const SDL_KEYMAPCHANGED: number;
  export const SDL_MOUSEMOTION: number;
  export const SDL_MOUSEBUTTONDOWN: number;
  export const SDL_MOUSEBUTTONUP: number;
  export const SDL_MOUSEWHEEL: number;
  export function start(args: {
    width: number;
    height: number;
    flags: number;
    start: (this: void) => void;
    update: (this: void) => void;
  }): void;
}
