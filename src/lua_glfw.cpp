#include "lua_glfw.hpp"
#include "lua_utils.hpp"

#ifdef USE_GLFW3
#include "gl_common.hpp"
#include "lua_glfw_impl.hpp"
#include <cstdint>
namespace {
GLFWwindow *g_main_window = nullptr;
lua_Integer g_glfw_update_ref = LUA_REFNIL;

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

  g_main_window = glfwCreateWindow(static_cast<int>(w), static_cast<int>(h), "",
                                   NULL, NULL);
  if (!g_main_window) {
    glfwTerminate();
    luaL_error(L, "Failed: glfwCreateWindow");
    return 0;
  }

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

  lua_pushcfunction(L, L_windowHint);
  lua_setfield(L, -2, "windowHint");

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

void start_glfw_main(lua_State *L) {
  if (g_glfw_update_ref == LUA_REFNIL) {
    return;
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
