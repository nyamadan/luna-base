#include "lua_sdl.hpp"
#include "lua_sdl_impl.hpp"
#include "gl_common.hpp"
#include "lua_utils.hpp"

#include <cstdint>

namespace {
SDL_GLContext g_current_context = nullptr;
SDL_Window *g_current_window = nullptr;

lua_Integer g_sdl_update_ref = LUA_REFNIL;
bool g_running = false;

void update(void *pData) {
  auto L = reinterpret_cast<lua_State *>(pData);

  SDL_Event event;
  g_running = true;
  while (SDL_PollEvent(&event)) {
    if (event.type == SDL_WINDOWEVENT &&
        event.window.event == SDL_WINDOWEVENT_CLOSE) {
      g_running = false;
    }
  }

  if (g_sdl_update_ref != LUA_REFNIL) {
    lua_rawgeti(L, LUA_REGISTRYINDEX, g_sdl_update_ref);
    lua_report(L, lua_docall(L, 0, 0));
    lua_settop(L, 0);
  }

  SDL_GL_SwapWindow(g_current_window);
}

int L_init(lua_State *L) {
  const auto flags = static_cast<std::uint32_t>(luaL_checkinteger(L, 1));
  auto result = SDL_Init(flags);
  lua_pushinteger(L, result);
  return 1;
}

int L_pollEvent(lua_State *L) {
  SDL_Event event;
  auto result = SDL_PollEvent(&event);
  lua_pushinteger(L, result);
  lua_newtable(L);

  lua_pushinteger(L, event.type);
  lua_setfield(L, -2, "type");

  lua_newtable(L);
  lua_pushinteger(L, event.window.event);
  lua_setfield(L, -2, "event");
  lua_setfield(L, -2, "window");
  return 2;
}

int L_GL_SetAttribute(lua_State *L) {
  const auto attr = static_cast<SDL_GLattr>(luaL_checkinteger(L, 1));
  const auto value = static_cast<int>(luaL_checkinteger(L, 2));
  const auto result = SDL_GL_SetAttribute(attr, value);
  lua_pushinteger(L, result);
  return 1;
}

int L_setShouldWindowClose(lua_State *L) {
  const lua_Integer value = luaL_checkinteger(L, 1);
  if (g_current_window == nullptr) {
    luaL_error(L, "window already destroyed?");
    return 0;
  }

  g_running = false;

  return 0;
}

int L_require(lua_State *L) {
  lua_newtable(L);

  lua_pushcfunction(L, L_init);
  lua_setfield(L, -2, "init");

  lua_pushcfunction(L, L_setShouldWindowClose);
  lua_setfield(L, -2, "setShouldWindowClose");

  lua_pushcfunction(L, L_GL_SetAttribute);
  lua_setfield(L, -2, "gl_SetAttribute");

  lua_pushinteger(L, SDL_INIT_VIDEO);
  lua_setfield(L, -2, "SDL_INIT_VIDEO");

  lua_pushinteger(L, SDL_INIT_EVENTS);
  lua_setfield(L, -2, "SDL_INIT_EVENTS");

  lua_pushinteger(L, SDL_WINDOWEVENT);
  lua_setfield(L, -2, "SDL_WINDOWEVENT");

  lua_pushinteger(L, SDL_WINDOWEVENT_CLOSE);
  lua_setfield(L, -2, "SDL_WINDOWEVENT_CLOSE");

  lua_pushinteger(L, SDL_GL_CONTEXT_PROFILE_MASK);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_PROFILE_MASK");

  lua_pushinteger(L, SDL_GL_CONTEXT_PROFILE_CORE);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_PROFILE_CORE");

  lua_pushinteger(L, SDL_GL_CONTEXT_MAJOR_VERSION);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_MAJOR_VERSION");

  lua_pushinteger(L, SDL_WINDOW_OPENGL);
  lua_setfield(L, -2, "SDL_WINDOW_OPENGL");

  lua_pushinteger(L, SDL_WINDOW_SHOWN);
  lua_setfield(L, -2, "SDL_WINDOW_SHOWN");
  return 1;
}

int L_start(lua_State *L) {
  lua_getfield(L, 1, "width");
  lua_Integer width = luaL_checkinteger(L, -1);
  lua_getfield(L, 1, "height");
  lua_Integer height = luaL_checkinteger(L, -1);
  lua_getfield(L, 1, "flags");
  lua_Integer flags = luaL_checkinteger(L, -1);

#ifndef __EMSCRIPTEN__
  if (gl3wInit()) {
    luaL_error(L, "Failed: gl3wInit");
    SDL_GL_DeleteContext(g_current_context);
    SDL_DestroyWindow(g_current_window);
    SDL_Quit();
    return 0;
  }
#endif

  if ((g_current_window = SDL_CreateWindow(
           "SDL2", 0, 0, static_cast<int>(width), static_cast<int>(height),
           SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN)) == 0) {
    SDL_Quit();
    luaL_error(L, "Failed: SDL_CreateWindow");
    return 0;
  }
  g_current_context = SDL_GL_CreateContext(g_current_window);

#ifndef __EMSCRIPTEN__
  if (gl3wInit() != 0) {
    luaL_error(L, "Failed: gl3wInit");
    return 0;
  }
#endif

  lua_getfield(L, 1, "update");
  g_sdl_update_ref = luaL_ref(L, LUA_REGISTRYINDEX);
  lua_getfield(L, 1, "start");
  lua_report(L, lua_docall(L, 0, 0));
  lua_settop(L, 0);

  return 0;
}
} // namespace

SDL_Window *get_current_sdl_window() { return g_current_window; }
SDL_GLContext get_current_sdl_context() { return g_current_context; }

void lua_open_sdl_libs(lua_State *L) {
  luaL_requiref(L, "SDL", L_require, false);
}

void start_sdl_main(lua_State *L) {
  if (g_sdl_update_ref == LUA_REFNIL) {
    return;
  }

#ifndef __EMSCRIPTEN__
  while (g_running) {
    update(L);
  }

  SDL_GL_DeleteContext(g_current_context);
  SDL_DestroyWindow(g_current_window);
  SDL_Quit();
#else
  emscripten_set_main_loop_arg(update, L, 0, true);
#endif
}