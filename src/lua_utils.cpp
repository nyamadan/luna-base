#include "lua_utils.hpp"

#include <iostream>
#include <map>
#include <string>

namespace {
lua_Integer g_error_logger = LUA_REFNIL;
void print_table_impl(lua_State *L, int idx, int level) {
  int type = lua_type(L, idx);
  switch (type) {
  case LUA_TNUMBER: {
    if (lua_isinteger(L, idx)) {
      std::cout << lua_tointeger(L, idx);

    } else {
      std::cout << lua_tonumber(L, idx);
    }
    break;
  }
  case LUA_TBOOLEAN: {
    if (lua_toboolean(L, idx)) {
      std::cout << "true";
    } else {
      std::cout << "false";
    }
    break;
  }
  case LUA_TSTRING: {
    std::cout << luaL_tolstring(L, idx, NULL);
    break;
  }
  case LUA_TUSERDATA: {
    std::cout << luaL_tolstring(L, idx, NULL);
    break;
  }
  case LUA_TNIL: {
    std::cout << "nil";
    break;
  }
  case LUA_TTABLE: {
    std::cout << "{" << std::endl;
    lua_pushnil(L);
    while (lua_next(L, idx) != 0) {
      int type = lua_type(L, -2);

      for (int i = 0; i <= level; i++) {
        std::cout << "  ";
      }
      switch (type) {
      case LUA_TSTRING: {
        std::cout << lua_tostring(L, -2) << " => ";
        break;
      }
      case LUA_TNUMBER: {
        if (lua_isinteger(L, -2)) {
          std::cout << lua_tointeger(L, -2) << " => ";
        } else {
          std::cout << lua_tonumber(L, -2) << " => ";
        }
        break;
      }
      default: {
        std::cout << "[" << lua_tostring(L, -2)
                  << "] = " << lua_typename(L, type);
        break;
      }
      }

      print_table_impl(L, lua_gettop(L), level + 1);
      lua_pop(L, 1);
    }
    for (int i = 0; i < level; i++) {
      std::cout << "  ";
    }
    std::cout << "}";
    break;
  }

  default: {
    std::cout << lua_typename(L, type);
    break;
  }
  }
  std::cout << std::endl;
}

int msghandler(lua_State *L) {
  const char *msg = lua_tostring(L, 1);
  if (msg == NULL) {                         /* is error object not a string? */
    if (luaL_callmeta(L, 1, "__tostring") && /* does it have a metamethod */
        lua_type(L, -1) == LUA_TSTRING)      /* that produces a string? */
      return 1;                              /* that is the message */
    else
      msg = lua_pushfstring(L, "(error object is a %s value)",
                            luaL_typename(L, 1));
  }
  luaL_traceback(L, L, msg, 1); /* append a standard traceback */
  return 1;                     /* return the traceback */
}

int L_isEmscripten(lua_State *L) {
#if defined(__EMSCRIPTEN__)
  lua_pushboolean(L, 1);
#else
  lua_pushboolean(L, 0);
#endif
  return 1;
}

int L_isApple(lua_State *L) {
#if defined(__APPLE__)
  lua_pushboolean(L, 1);
#else
  lua_pushboolean(L, 0);
#endif
  return 1;
}

int L_isWindows(lua_State *L) {
#if defined(__MINGW32__) || defined(_MSC_VER)
  lua_pushboolean(L, 1);
#else
  lua_pushboolean(L, 0);
#endif
  return 1;
}

int L_isLinux(lua_State *L) {
#if defined(__linux__)
  lua_pushboolean(L, 1);
#else
  lua_pushboolean(L, 0);
#endif
  return 1;
}

int L_setErrorLogger(lua_State *L) {
  lua_pushvalue(L, 1);

  if (g_error_logger == LUA_REFNIL) {
    luaL_unref(L, LUA_REGISTRYINDEX, g_error_logger);
    g_error_logger = LUA_REFNIL;
  }

  g_error_logger = luaL_ref(L, LUA_REGISTRYINDEX);

  return 0;
}

int L_require(lua_State *L) {
  lua_newtable(L);

  lua_pushcfunction(L, L_isEmscripten);
  lua_setfield(L, -2, "isEmscripten");

  lua_pushcfunction(L, L_isWindows);
  lua_setfield(L, -2, "isWindows");

  lua_pushcfunction(L, L_isApple);
  lua_setfield(L, -2, "isApple");

  lua_pushcfunction(L, L_isLinux);
  lua_setfield(L, -2, "isLinux");

  lua_pushcfunction(L, L_setErrorLogger);
  lua_setfield(L, -2, "setErrorLogger");

  return 1;
}

} // namespace

int print_table(lua_State *L) {
  int top = lua_gettop(L);
  for (int i = top; i > 0; --i) {
    std::cout << "STACK[" << i << "] => ";
    print_table_impl(L, i, 0);
  }
  return 0;
}

void lua_open_util_libs(lua_State *L) {
  luaL_requiref(L, "utils", L_require, false);
}

int lua_docall(lua_State *L, int narg, int nres) {
  int status;
  int base = lua_gettop(L) - narg;  /* function index */
  lua_pushcfunction(L, msghandler); /* push message handler */
  lua_insert(L, base);              /* put it under function and args */
  status = lua_pcall(L, narg, nres, base);
  lua_remove(L, base); /* remove message handler from the stack */
  return status;
}

int lua_report(lua_State *L, int status) {
  if (status != LUA_OK) {
    auto msg = lua_tostring(L, -1);

    auto top = lua_gettop(L);

    if (g_error_logger != LUA_REFNIL) {
      lua_rawgeti(L, LUA_REGISTRYINDEX, g_error_logger);
      lua_pushstring(L, msg);
      int logger_status = lua_docall(L, 1, 0);
      if (logger_status != LUA_OK) {
        auto logger_msg = lua_tostring(L, -1);
        lua_writestringerror("Logger Error: %s\n", logger_msg);
        lua_writestringerror("Script Error: %s\n", msg);
      }
    } else {
      lua_writestringerror("%s\n", msg);
    }

    lua_settop(L, top - 1); /* remove message */
  }
  return status;
}
