/** @noSelfInFile */
/** @noResolution */
declare module "sdl" {
  export function init(flags: number): number;
  export function pollEvent(): LuaMultiReturn<[
    number,
    {
      type: number;
      window: {
        event: number;
      };
    }
  ]>;
  export function setShouldWindowClose(x: boolean): void;
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

  export function start(args: {
    width: number;
    height: number;
    flags: number;
    start: (this: void) => void;
    update: (this: void) => void;
  }): void;
}
