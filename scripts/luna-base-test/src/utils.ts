import * as _gl from "gl";
import * as glfw from "glfw";
import * as sdl from "sdl";
import { isEmscripten } from "luna-base-utils";
import { OS_NAME } from "luna-base/dist/platform";
import { assertIsNull } from "luna-base/dist/type_utils";

export const test = function <
  T extends {
    setUp: () => void;
    tearDown: () => void;
  }
>(this: void, name: string, t: T) {
  const global = _G as Record<string, any>;
  assertIsNull(global[name], `already registered: ${name}`);
  global[name] = t;
};

export function initGlfw(this: void): boolean {
  if(glfw.init == null) {
    return false;
  }
  const width = 1;
  const height = 1;

  glfw.init();

  if (isEmscripten()) {
    glfw.windowHint(glfw.CLIENT_API, glfw.OPENGL_ES_API);
    glfw.windowHint(glfw.CONTEXT_VERSION_MAJOR, 3);
    glfw.windowHint(glfw.CONTEXT_VERSION_MINOR, 0);
  } else if (OS_NAME === "MacOS") {
    glfw.windowHint(glfw.CONTEXT_VERSION_MAJOR, 3);
    glfw.windowHint(glfw.CONTEXT_VERSION_MINOR, 2);
    glfw.windowHint(glfw.OPENGL_FORWARD_COMPAT, glfw.TRUE);
    glfw.windowHint(glfw.OPENGL_PROFILE, glfw.OPENGL_CORE_PROFILE);
  }

  glfw.windowHint(glfw.VISIBLE, glfw.FALSE);
  glfw.windowHint(glfw.OPENGL_DEBUG_CONTEXT, glfw.TRUE);

  glfw.start({
    width,
    height,
    start: function () {},
    update: function () {},
  });
  glfw.setShouldWindowClose(glfw.TRUE);

  return true;
}

export function initSDL2(this: void): boolean {
  const width = 1;
  const height = 1;
  if(sdl.init == null) {
    return false;
  }

  sdl.init(sdl.SDL_INIT_VIDEO | sdl.SDL_INIT_EVENTS);

  if (isEmscripten()) {
    sdl.GL_Set_Attribute(
      sdl.SDL_GL_CONTEXT_PROFILE_MASK,
      sdl.SDL_GL_CONTEXT_PROFILE_ES
    );
    sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MAJOR_VERSION, 3);
    sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MINOR_VERSION, 0);
  } else if (OS_NAME === "MacOS") {
    sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MAJOR_VERSION, 3);
    sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MINOR_VERSION, 2);
    sdl.GL_Set_Attribute(
      sdl.SDL_GL_CONTEXT_FLAGS,
      sdl.SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG
    );
    sdl.GL_Set_Attribute(
      sdl.SDL_GL_CONTEXT_PROFILE_MASK,
      sdl.SDL_GL_CONTEXT_PROFILE_CORE
    );
  }
  sdl.start({
    width,
    height,
    flags: sdl.SDL_WINDOW_OPENGL,
    start: function () {},
    update: function () {},
  });
  sdl.setShouldWindowClose(true);

  return true;
}
