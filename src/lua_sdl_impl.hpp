
#ifndef __LUA_LUA_SDL_IMPL_HPP__
#define __LUA_LUA_SDL_IMPL_HPP__

#include "gl_common.hpp"
#include "lua_common.hpp"

#include <SDL.h>
SDL_Window *get_current_sdl_window();
SDL_GLContext get_current_sdl_context();
const SDL_Event *get_last_sdl_event();

#endif
