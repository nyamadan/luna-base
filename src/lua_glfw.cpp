#include "lua_glfw.hpp"
#include "lua_utils.hpp"

#ifdef USE_GLFW3
#include "gl_common.hpp"
#include "lua_glfw_impl.hpp"
#include <cstdint>
#include <vector>
namespace {
GLFWwindow *g_main_window = nullptr;
lua_Integer g_glfw_update_ref = LUA_REFNIL;

struct KeyEvent {
  int key;
  int scancode;
  int action;
  int mods;
};
std::vector<KeyEvent> g_key_events;

enum MouseEventType {
  POSITION,
  BUTTON,
};
struct MouseEvent {
  MouseEventType event;
  double xpos;
  double ypos;
  int button;
  int action;
  int mods;
};

std::vector<MouseEvent> g_mouse_events;

void keyCallback(GLFWwindow *window, int key, int scancode, int action,
                 int mods) {
  g_key_events.push_back(KeyEvent{key, scancode, action, mods});
}

void cursorPositionCallback(GLFWwindow *window, double xpos, double ypos) {
  g_mouse_events.push_back(MouseEvent{POSITION, xpos, ypos, 0, 0, 0});
}

void mouseButtonCallback(GLFWwindow *window, int button, int action, int mods) {
  g_mouse_events.push_back(MouseEvent{BUTTON, 0, 0, button, action, mods});
}

int L_getKeyEvents(lua_State *L) {
  lua_newtable(L);

  for (auto iter = g_key_events.cbegin(); iter != g_key_events.cend(); ++iter) {
    lua_newtable(L);

    lua_pushinteger(L, iter->key);
    lua_setfield(L, -2, "key");

    lua_pushinteger(L, iter->scancode);
    lua_setfield(L, -2, "scancode");

    lua_pushinteger(L, iter->action);
    lua_setfield(L, -2, "action");

    lua_pushinteger(L, iter->mods);
    lua_setfield(L, -2, "mods");

    auto idx = iter - g_key_events.cbegin() + 1;
    lua_rawseti(L, -2, idx);
  }

  return 1;
}

int L_clearKeyEvents(lua_State *L) {
  g_key_events.clear();
  return 0;
}

int L_getMouseEvents(lua_State *L) {
  lua_newtable(L);

  for (auto iter = g_mouse_events.cbegin(); iter != g_mouse_events.cend();
       ++iter) {
    lua_newtable(L);

    switch (iter->event) {
    case POSITION: {
      lua_pushstring(L, "position");
      lua_setfield(L, -2, "event");
      lua_pushnumber(L, static_cast<lua_Number>(iter->xpos));
      lua_setfield(L, -2, "xpos");
      lua_pushnumber(L, static_cast<lua_Number>(iter->ypos));
      lua_setfield(L, -2, "ypos");
      break;
    }

    case BUTTON: {
      lua_pushstring(L, "button");
      lua_setfield(L, -2, "event");
      lua_pushinteger(L, iter->button);
      lua_setfield(L, -2, "button");
      lua_pushinteger(L, iter->action);
      lua_setfield(L, -2, "action");
      lua_pushinteger(L, iter->mods);
      lua_setfield(L, -2, "mods");
      break;
    }

    default: {
      luaL_error(L, "unknown event type: %d", iter->event);
    }
    }
    auto idx = iter - g_mouse_events.cbegin() + 1;
    lua_rawseti(L, -2, idx);
  }

  return 1;
}

int L_clearMouseEvents(lua_State *L) {
  g_mouse_events.clear();
  return 0;
}

int L_init(lua_State *L) {
  if (!glfwInit()) {
    luaL_error(L, "Failed: glfwInit");
  }

  return 0;
}

int L_start(lua_State *L) {
  lua_getfield(L, 1, "width");
  lua_Integer w = luaL_checkinteger(L, -1);
  lua_getfield(L, 1, "height");
  lua_Integer h = luaL_checkinteger(L, -1);

  if (g_main_window != nullptr) {
    luaL_error(L, "g_main_windows is not null.");
    return 0;
  }

  g_main_window = glfwCreateWindow(static_cast<int>(w), static_cast<int>(h), "",
                                   NULL, NULL);
  if (!g_main_window) {
    glfwTerminate();
    luaL_error(L, "Failed: glfwCreateWindow");
    return 0;
  }

  glfwSetKeyCallback(g_main_window, keyCallback);
  glfwSetCursorPosCallback(g_main_window, cursorPositionCallback);
  glfwSetMouseButtonCallback(g_main_window, mouseButtonCallback);

  glfwMakeContextCurrent(g_main_window);

#ifndef __EMSCRIPTEN__
  if (gl3wInit() != 0) {
    luaL_error(L, "Failed: gl3wInit");
    return 0;
  }
#endif

  lua_getfield(L, 1, "update");
  g_glfw_update_ref = luaL_ref(L, LUA_REGISTRYINDEX);
  lua_getfield(L, 1, "start");
  lua_report(L, lua_docall(L, 0, 0));
  lua_settop(L, 0);

  return 0;
}

int L_destroyWindow(lua_State *L) {
  if (g_main_window == nullptr) {
    luaL_error(L, "window already destroyed?");
    return 0;
  }

  glfwDestroyWindow(g_main_window);
  g_main_window = nullptr;
  return 0;
}

int L_setShouldWindowClose(lua_State *L) {
  const lua_Integer value = luaL_checkinteger(L, 1);
  if (g_main_window == nullptr) {
    luaL_error(L, "window already destroyed?");
    return 0;
  }

  glfwSetWindowShouldClose(g_main_window, static_cast<int>(value));
  return 0;
}

int L_windowHint(lua_State *L) {
  const lua_Integer hint = luaL_checkinteger(L, 1);
  const lua_Integer value = luaL_checkinteger(L, 2);
  glfwWindowHint(static_cast<int>(hint), static_cast<int>(value));
  return 0;
}

int L_pollEvents(lua_State *L) {
  glfwPollEvents();
  return 0;
}

void update(void *pData) {
  auto L = reinterpret_cast<lua_State *>(pData);

  if (g_glfw_update_ref != LUA_REFNIL) {
    lua_rawgeti(L, LUA_REGISTRYINDEX, g_glfw_update_ref);
    lua_report(L, lua_docall(L, 0, 0));
    lua_settop(L, 0);
  }

  if (g_main_window != nullptr) {
    glfwSwapBuffers(g_main_window);
    glfwPollEvents();
  }
}

int L_require(lua_State *L) {
  lua_newtable(L);

  lua_pushinteger(L, GLFW_FALSE);
  lua_setfield(L, -2, "FALSE");

  lua_pushinteger(L, GLFW_TRUE);
  lua_setfield(L, -2, "TRUE");

  lua_pushinteger(L, GLFW_VISIBLE);
  lua_setfield(L, -2, "VISIBLE");

  lua_pushinteger(L, GLFW_RESIZABLE);
  lua_setfield(L, -2, "RESIZABLE");

  lua_pushinteger(L, GLFW_OPENGL_ES_API);
  lua_setfield(L, -2, "OPENGL_ES_API");

  lua_pushinteger(L, GLFW_CLIENT_API);
  lua_setfield(L, -2, "CLIENT_API");

  lua_pushinteger(L, GLFW_CONTEXT_VERSION_MAJOR);
  lua_setfield(L, -2, "CONTEXT_VERSION_MAJOR");

  lua_pushinteger(L, GLFW_CONTEXT_VERSION_MINOR);
  lua_setfield(L, -2, "CONTEXT_VERSION_MINOR");

  lua_pushinteger(L, GLFW_OPENGL_FORWARD_COMPAT);
  lua_setfield(L, -2, "OPENGL_FORWARD_COMPAT");

  lua_pushinteger(L, GLFW_OPENGL_PROFILE);
  lua_setfield(L, -2, "OPENGL_PROFILE");

  lua_pushinteger(L, GLFW_OPENGL_CORE_PROFILE);
  lua_setfield(L, -2, "OPENGL_CORE_PROFILE");

  lua_pushinteger(L, GLFW_OPENGL_DEBUG_CONTEXT);
  lua_setfield(L, -2, "OPENGL_DEBUG_CONTEXT");

  lua_pushinteger(L, GLFW_MOUSE_BUTTON_LEFT);
  lua_setfield(L, -2, "MOUSE_BUTTON_LEFT");
  lua_pushinteger(L, GLFW_MOUSE_BUTTON_MIDDLE);
  lua_setfield(L, -2, "MOUSE_BUTTON_MIDDLE");
  lua_pushinteger(L, GLFW_MOUSE_BUTTON_RIGHT);
  lua_setfield(L, -2, "MOUSE_BUTTON_RIGHT");

  lua_pushinteger(L, GLFW_RELEASE);
  lua_setfield(L, -2, "RELEASE");
  lua_pushinteger(L, GLFW_PRESS);
  lua_setfield(L, -2, "PRESS");
  lua_pushinteger(L, GLFW_REPEAT);
  lua_setfield(L, -2, "REPEAT");

  lua_pushinteger(L, GLFW_MOD_SHIFT);
  lua_setfield(L, -2, "MOD_SHIFT");
  lua_pushinteger(L, GLFW_MOD_CONTROL);
  lua_setfield(L, -2, "MOD_CONTROL");
  lua_pushinteger(L, GLFW_MOD_ALT);
  lua_setfield(L, -2, "MOD_ALT");
  lua_pushinteger(L, GLFW_MOD_SUPER);
  lua_setfield(L, -2, "MOD_SUPER");
  lua_pushinteger(L, GLFW_MOD_CAPS_LOCK);
  lua_setfield(L, -2, "CAPS_LOCK");
  lua_pushinteger(L, GLFW_MOD_NUM_LOCK);
  lua_setfield(L, -2, "NUM_LOCK");

  lua_pushcfunction(L, L_windowHint);
  lua_setfield(L, -2, "windowHint");

  lua_pushcfunction(L, L_getMouseEvents);
  lua_setfield(L, -2, "getMouseEvents");

  lua_pushcfunction(L, L_clearMouseEvents);
  lua_setfield(L, -2, "clearMouseEvents");

  lua_pushcfunction(L, L_getKeyEvents);
  lua_setfield(L, -2, "getKeyEvents");

  lua_pushcfunction(L, L_clearKeyEvents);
  lua_setfield(L, -2, "clearKeyEvents");

  lua_pushcfunction(L, L_init);
  lua_setfield(L, -2, "init");

  lua_pushcfunction(L, L_start);
  lua_setfield(L, -2, "start");

  lua_pushcfunction(L, L_pollEvents);
  lua_setfield(L, -2, "pollEvents");

  lua_pushcfunction(L, L_destroyWindow);
  lua_setfield(L, -2, "destroyWindow");

  lua_pushcfunction(L, L_setShouldWindowClose);
  lua_setfield(L, -2, "setShouldWindowClose");

  return 1;
}

} // namespace

GLFWwindow *get_current_glfw_window() { return g_main_window; }

void lua_open_glfw_libs(lua_State *L) {
  luaL_requiref(L, "glfw", L_require, false);
}

int start_glfw_main(lua_State *L) {
  if (g_glfw_update_ref == LUA_REFNIL) {
    return -1;
  }

#ifndef __EMSCRIPTEN__
  glfwSwapInterval(1);

  while (g_main_window != nullptr && !glfwWindowShouldClose(g_main_window)) {
    update(L);
  }

  glfwTerminate();
#else
  emscripten_set_main_loop_arg(update, L, 0, true);
#endif

  return 0;
}
#else
namespace {
int L_require(lua_State *L) {
  lua_newtable(L);

  return 1;
}
} // namespace
void lua_open_glfw_libs(lua_State *L) {
  luaL_requiref(L, "glfw", L_require, false);
}
#endif
