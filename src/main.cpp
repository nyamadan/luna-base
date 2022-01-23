#ifndef USE_GLFW3
#include <SDL.h>
#endif

#include "lua_gl_bindings.hpp"
#include "lua_glfw.hpp"
#include "lua_sdl.hpp"
#include "lua_imgui.hpp"
#include "lua_msgpack.hpp"
#include "lua_native_buffer.hpp"
#include "lua_png.hpp"
#include "lua_utils.hpp"

#include <cstdint>

int main(int argc, char **argv) {
  if (argc <= 1) {
    return 1;
  }

  const char *path = argv[1];

  lua_State *L = luaL_newstate();

  luaL_openlibs(L);
  lua_open_png_libs(L);
  lua_open_buffer_libs(L);
  lua_open_util_libs(L);
  lua_open_msgpack_libs(L);
  lua_open_glfw_libs(L);
  lua_open_sdl_libs(L);
  lua_open_imgui_libs(L);
  lua_open_gl_libs(L);

  std::int32_t status;
  status = luaL_loadfile(L, argv[1]);
  if (status != LUA_OK) {
    lua_report(L, status);
    return 1;
  }

  status = lua_docall(L, 0, 0);
  lua_report(L, status);

#ifdef USE_GLFW3
  start_glfw_main(L);
#else
  start_sdl_main(L);
#endif
}