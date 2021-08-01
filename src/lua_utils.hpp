#ifndef __LUA_UTILS_HPP__
#define __LUA_UTILS_HPP__

#include "lua_common.hpp"

int print_table(lua_State *L);
void lua_open_util_libs(lua_State *L);
int lua_docall(lua_State *L, int narg, int nres);
int lua_report(lua_State *L, int status);
#endif