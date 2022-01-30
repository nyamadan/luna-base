#include "lua_sdl.hpp"
#include "lua_utils.hpp"

#if USE_SDL2

#include "gl_common.hpp"
#include "lua_sdl_impl.hpp"
#include <cstdint>

namespace {
SDL_GLContext g_current_context = nullptr;
SDL_Window *g_current_window = nullptr;

lua_Integer g_sdl_update_ref = LUA_REFNIL;
SDL_Event g_last_event = {0};
bool g_running = false;

void update(void *pData) {
  auto L = reinterpret_cast<lua_State *>(pData);

  if (g_sdl_update_ref != LUA_REFNIL) {
    lua_rawgeti(L, LUA_REGISTRYINDEX, g_sdl_update_ref);
    lua_report(L, lua_docall(L, 0, 0));
    lua_settop(L, 0);
  } else {
    g_running = false;
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
  auto result = SDL_PollEvent(&g_last_event);
  lua_pushinteger(L, result);
  lua_newtable(L); // root

  lua_pushinteger(L, g_last_event.type);
  lua_setfield(L, -2, "type");

  lua_newtable(L); // window
  lua_pushinteger(L, g_last_event.window.event);
  lua_setfield(L, -2, "event");
  lua_setfield(L, -2, "window"); // pop window

  lua_newtable(L); // button
  lua_pushinteger(L, g_last_event.button.button);
  lua_setfield(L, -2, "button");
  lua_pushinteger(L, g_last_event.button.clicks);
  lua_setfield(L, -2, "clicks");
  lua_pushinteger(L, g_last_event.button.state);
  lua_setfield(L, -2, "state");
  lua_pushinteger(L, g_last_event.button.timestamp);
  lua_setfield(L, -2, "timestamp");
  lua_pushinteger(L, g_last_event.button.type);
  lua_setfield(L, -2, "type");
  lua_pushinteger(L, g_last_event.button.which);
  lua_setfield(L, -2, "which");
  lua_pushinteger(L, g_last_event.button.windowID);
  lua_setfield(L, -2, "windowID");
  lua_pushinteger(L, g_last_event.button.x);
  lua_setfield(L, -2, "x");
  lua_pushinteger(L, g_last_event.button.y);
  lua_setfield(L, -2, "y");
  lua_setfield(L, -2, "button"); // pop button

  lua_newtable(L); // motion
  lua_pushinteger(L, g_last_event.motion.state);
  lua_setfield(L, -2, "state");
  lua_pushinteger(L, g_last_event.motion.timestamp);
  lua_setfield(L, -2, "timestamp");
  lua_pushinteger(L, g_last_event.motion.type);
  lua_setfield(L, -2, "type");
  lua_pushinteger(L, g_last_event.motion.which);
  lua_setfield(L, -2, "which");
  lua_pushinteger(L, g_last_event.motion.windowID);
  lua_setfield(L, -2, "windowID");
  lua_pushinteger(L, g_last_event.motion.x);
  lua_setfield(L, -2, "x");
  lua_pushinteger(L, g_last_event.motion.xrel);
  lua_setfield(L, -2, "xrel");
  lua_pushinteger(L, g_last_event.motion.y);
  lua_setfield(L, -2, "y");
  lua_pushinteger(L, g_last_event.motion.yrel);
  lua_setfield(L, -2, "yrel");
  lua_setfield(L, -2, "motion"); // pop motion

  lua_newtable(L); // wheel
  lua_pushinteger(L, g_last_event.wheel.direction);
  lua_setfield(L, -2, "direction");
  lua_pushnumber(L, g_last_event.wheel.preciseX);
  lua_setfield(L, -2, "preciseX");
  lua_pushnumber(L, g_last_event.wheel.preciseY);
  lua_setfield(L, -2, "preciseY");
  lua_pushinteger(L, g_last_event.wheel.timestamp);
  lua_setfield(L, -2, "timestamp");
  lua_pushinteger(L, g_last_event.wheel.type);
  lua_setfield(L, -2, "type");
  lua_pushinteger(L, g_last_event.wheel.which);
  lua_setfield(L, -2, "which");
  lua_pushinteger(L, g_last_event.wheel.windowID);
  lua_setfield(L, -2, "windowID");
  lua_pushinteger(L, g_last_event.wheel.x);
  lua_setfield(L, -2, "x");
  lua_pushinteger(L, g_last_event.wheel.y);
  lua_setfield(L, -2, "y");
  lua_setfield(L, -2, "wheel"); // pop wheel

  lua_newtable(L); // key
  lua_pushinteger(L, g_last_event.key.repeat);
  lua_setfield(L, -2, "repeat");
  lua_pushinteger(L, g_last_event.key.state);
  lua_setfield(L, -2, "state");
  lua_pushinteger(L, g_last_event.key.timestamp);
  lua_setfield(L, -2, "timestamp");
  lua_pushinteger(L, g_last_event.key.type);
  lua_setfield(L, -2, "type");
  lua_pushinteger(L, g_last_event.key.windowID);
  lua_setfield(L, -2, "windowID");
  lua_newtable(L); // keysym
  lua_pushinteger(L, g_last_event.key.keysym.sym);
  lua_setfield(L, -2, "sym");
  lua_pushinteger(L, g_last_event.key.keysym.mod);
  lua_setfield(L, -2, "mod");
  lua_pushinteger(L, g_last_event.key.keysym.scancode);
  lua_setfield(L, -2, "scancode");
  lua_setfield(L, -2, "keysym"); // pop keysym
  lua_setfield(L, -2, "key");    // pop key
  return 2;
}

int L_GL_SetAttribute(lua_State *L) {
  const auto attr = static_cast<SDL_GLattr>(luaL_checkinteger(L, 1));
  const auto value = static_cast<int>(luaL_checkinteger(L, 2));
  const auto result = SDL_GL_SetAttribute(attr, value);
  lua_pushinteger(L, result);
  return 1;
}

int L_SetWindowPosition(lua_State *L) {
  if (g_current_window == nullptr) {
    luaL_error(L, "window created?");
  }
  const auto x = static_cast<int>(luaL_checkinteger(L, 1));
  const auto y = static_cast<int>(luaL_checkinteger(L, 2));
  SDL_SetWindowPosition(g_current_window, x, y);
  return 0;
}

int L_setShouldWindowClose(lua_State *L) {
  const bool value = lua_toboolean(L, 1);
  if (g_current_window == nullptr) {
    luaL_error(L, "window already destroyed?");
    return 0;
  }

  g_running = !value;

  return 0;
}

int L_start(lua_State *L) {
  lua_getfield(L, 1, "width");
  lua_Integer width = luaL_checkinteger(L, -1);
  lua_getfield(L, 1, "height");
  lua_Integer height = luaL_checkinteger(L, -1);
  lua_getfield(L, 1, "flags");
  Uint32 flags = static_cast<Uint32>(luaL_checkinteger(L, -1));

  if ((g_current_window = SDL_CreateWindow(
           "", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED,
           static_cast<int>(width), static_cast<int>(height), flags)) == 0) {
    SDL_Quit();
    luaL_error(L, "Failed: SDL_CreateWindow");
    return 0;
  }

  g_current_context = SDL_GL_CreateContext(g_current_window);

#ifndef __EMSCRIPTEN__
  if (gl3wInit()) {
    SDL_GL_DeleteContext(g_current_context);
    SDL_DestroyWindow(g_current_window);
    SDL_Quit();
    luaL_error(L, "Failed: gl3wInit");
    return 0;
  }
#endif

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

  g_running = true;

  return 0;
}

int L_require(lua_State *L) {
  lua_newtable(L);

  lua_pushcfunction(L, L_init);
  lua_setfield(L, -2, "init");

  lua_pushcfunction(L, L_start);
  lua_setfield(L, -2, "start");

  lua_pushcfunction(L, L_pollEvent);
  lua_setfield(L, -2, "pollEvent");

  lua_pushcfunction(L, L_SetWindowPosition);
  lua_setfield(L, -2, "setWindowPosition");

  lua_pushcfunction(L, L_setShouldWindowClose);
  lua_setfield(L, -2, "setShouldWindowClose");

  lua_pushcfunction(L, L_GL_SetAttribute);
  lua_setfield(L, -2, "GL_Set_Attribute");

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

  lua_pushinteger(L, SDL_GL_CONTEXT_FLAGS);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_FLAGS");

  lua_pushinteger(L, SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG");

  lua_pushinteger(L, SDL_GL_CONTEXT_PROFILE_ES);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_PROFILE_ES");

  lua_pushinteger(L, SDL_GL_CONTEXT_MAJOR_VERSION);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_MAJOR_VERSION");

  lua_pushinteger(L, SDL_GL_CONTEXT_MINOR_VERSION);
  lua_setfield(L, -2, "SDL_GL_CONTEXT_MINOR_VERSION");

  lua_pushinteger(L, SDL_WINDOW_OPENGL);
  lua_setfield(L, -2, "SDL_WINDOW_OPENGL");

  lua_pushinteger(L, SDL_WINDOW_SHOWN);
  lua_setfield(L, -2, "SDL_WINDOW_SHOWN");

  lua_pushinteger(L, SDL_WINDOW_HIDDEN);
  lua_setfield(L, -2, "SDL_WINDOW_HIDDEN");

  lua_pushinteger(L, SDL_WINDOW_ALLOW_HIGHDPI);
  lua_setfield(L, -2, "SDL_WINDOW_ALLOW_HIGHDPI");

  lua_pushinteger(L, SDL_WINDOWPOS_CENTERED);
  lua_setfield(L, -2, "SDL_WINDOWPOS_CENTERED");

  lua_pushinteger(L, SDL_KEYDOWN);
  lua_setfield(L, -2, "SDL_KEYDOWN");
  lua_pushinteger(L, SDL_KEYUP);
  lua_setfield(L, -2, "SDL_KEYUP");
  lua_pushinteger(L, SDL_TEXTEDITING);
  lua_setfield(L, -2, "SDL_TEXTEDITING");
  lua_pushinteger(L, SDL_TEXTINPUT);
  lua_setfield(L, -2, "SDL_TEXTINPUT");
  lua_pushinteger(L, SDL_KEYMAPCHANGED);
  lua_setfield(L, -2, "SDL_KEYMAPCHANGED");

  lua_pushinteger(L, SDL_MOUSEMOTION);
  lua_setfield(L, -2, "SDL_MOUSEMOTION");
  lua_pushinteger(L, SDL_MOUSEBUTTONDOWN);
  lua_setfield(L, -2, "SDL_MOUSEBUTTONDOWN");
  lua_pushinteger(L, SDL_MOUSEBUTTONUP);
  lua_setfield(L, -2, "SDL_MOUSEBUTTONUP");
  lua_pushinteger(L, SDL_MOUSEWHEEL);
  lua_setfield(L, -2, "SDL_MOUSEWHEEL");
  return 1;
}
} // namespace

SDL_Window *get_current_sdl_window() { return g_current_window; }
SDL_GLContext get_current_sdl_context() { return g_current_context; }
const SDL_Event *get_last_sdl_event() {
  return static_cast<const SDL_Event *>(&g_last_event);
}

void lua_open_sdl_libs(lua_State *L) {
  luaL_requiref(L, "sdl", L_require, false);
}

int start_sdl_main(lua_State *L) {
  if (g_sdl_update_ref == LUA_REFNIL) {
    return -1;
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
  return 0;
}
#else
namespace {
int L_require(lua_State *L) {
  lua_newtable(L);

  return 1;
}
} // namespace
void lua_open_sdl_libs(lua_State *L) {
  luaL_requiref(L, "sdl", L_require, false);
}
#endif