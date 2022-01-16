import * as _gl from "gl";
import * as glfw from "glfw";
import { isEmscripten } from "luna-base-utils";
import { OS_NAME } from "luna-base/dist/platform";
import { assertIsNull } from "luna-base/dist/type_utils";

export const test = function <
  T extends {
    setUp: () => void;
    tearDown: () => void;
  }
>(name: string, t: T) {
  const global = _G as Record<string, any>;
  assertIsNull(global[name], `already registered: ${name}`);
  global[name] = t;
};

export function initGlfw() {
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
}