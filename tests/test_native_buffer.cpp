#include "../src/lua_common.hpp"
#include "../src/lua_native_buffer.hpp"

#include <cstdint>
#include <cstring>
#include <gtest/gtest.h>

TEST(Buffer, RequireBuffer) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer')");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  ASSERT_EQ(LUA_TTABLE, lua_type(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, SizeOfBool) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').SIZE_OF_BOOL");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  ASSERT_EQ(sizeof(bool), luaL_checkinteger(L, -1));

  lua_close(L);

  SUCCEED();
}


TEST(Buffer, SizeOfPointer) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').SIZE_OF_POINTER");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  ASSERT_EQ(sizeof(std::int32_t *), luaL_checkinteger(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, NewBuffer) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(4)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(4, luaL_len(L, idx));

  lua_getfield(L, idx, "free");
  lua_pushvalue(L, idx);

  if (lua_pcall(L, 1, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  ASSERT_EQ(0, luaL_len(L, idx));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetString) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(32)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(32, luaL_len(L, idx));

  lua_getfield(L, idx, "set_string");
  lua_pushvalue(L, idx);
  const char *const hello = "Hello World!";
  const std::size_t hello_len = std::strlen(hello);
  lua_pushlstring(L, hello, hello_len);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  ASSERT_EQ(hello_len, luaL_checkinteger(L, -1));

  lua_getfield(L, idx, "get_string");
  lua_pushvalue(L, idx);
  if (lua_pcall(L, 1, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  ASSERT_STREQ(hello, luaL_checkstring(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetBool) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(8)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(8, luaL_len(L, idx));

  lua_getfield(L, idx, "set_bool");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  lua_pushboolean(L, true);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "get_bool");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(true, lua_toboolean(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetUint8) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(2)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(2, luaL_len(L, idx));

  lua_getfield(L, idx, "set_uint8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  lua_pushinteger(L, 32);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "set_uint8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 1);
  lua_pushinteger(L, 16);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "get_uint8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(32, luaL_checkinteger(L, -1));

  lua_getfield(L, idx, "get_uint8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 1);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(16, luaL_checkinteger(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetUint16) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(4)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(4, luaL_len(L, idx));

  lua_getfield(L, idx, "set_uint16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  lua_pushinteger(L, 32);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "set_uint16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 2);
  lua_pushinteger(L, 16);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "get_uint16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(32, luaL_checkinteger(L, -1));

  lua_getfield(L, idx, "get_uint16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 2);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(16, luaL_checkinteger(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetInt8) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(2)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(2, luaL_len(L, idx));

  lua_getfield(L, idx, "set_int8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  lua_pushinteger(L, 32);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "set_int8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 1);
  lua_pushinteger(L, 16);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "get_int8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(32, luaL_checkinteger(L, -1));

  lua_getfield(L, idx, "get_int8");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 1);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(16, luaL_checkinteger(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetInt16) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(4)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(4, luaL_len(L, idx));

  lua_getfield(L, idx, "set_int16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  lua_pushinteger(L, 32);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "set_int16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 2);
  lua_pushinteger(L, 16);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "get_int16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(32, luaL_checkinteger(L, -1));

  lua_getfield(L, idx, "get_int16");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 2);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(16, luaL_checkinteger(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetInt32) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(8)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(8, luaL_len(L, idx));

  lua_getfield(L, idx, "set_int32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  lua_pushinteger(L, 32);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "set_int32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 4);
  lua_pushinteger(L, 16);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "get_int32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(32, luaL_checkinteger(L, -1));

  lua_getfield(L, idx, "get_int32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 4);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(16, luaL_checkinteger(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, GetSetFloat32) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(8)");

  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");

  auto idx = lua_gettop(L);

  ASSERT_EQ(8, luaL_len(L, idx));

  lua_getfield(L, idx, "set_float32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  lua_pushnumber(L, 32.25f);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "set_float32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 4);
  lua_pushnumber(L, 16.25f);
  if (lua_pcall(L, 3, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, idx, "get_float32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(32.25f, luaL_checknumber(L, -1));

  lua_getfield(L, idx, "get_float32");
  lua_pushvalue(L, idx);
  lua_pushinteger(L, 4);
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_EQ(16.25f, luaL_checknumber(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, CopyBuffer) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return require('native_buffer').new_buffer(8), "
                     "require('native_buffer').new_buffer(8)");

  if (lua_pcall(L, 0, 2, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");
  luaL_checkudata(L, -2, "LUA_USERDATA_TYPE_BUFFER");

  auto a = lua_gettop(L);
  auto b = a - 1;

  lua_getfield(L, a, "set_string");
  lua_pushvalue(L, a);
  lua_pushstring(L, "ABC");
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, b, "set_string");
  lua_pushvalue(L, b);
  lua_pushstring(L, "123");
  if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_loadstring(L, "return require('native_buffer').copy_buffer");
  if (lua_pcall(L, 0, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  ASSERT_TRUE(lua_isfunction(L, -1)) << "copy_buffer is not function.";

  lua_pushvalue(L, a);
  lua_pushinteger(L, 0);
  lua_pushvalue(L, b);
  lua_pushinteger(L, 0);
  lua_pushinteger(L, 3);
  if (lua_pcall(L, 5, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_getfield(L, a, "get_string");
  lua_pushvalue(L, a);
  if (lua_pcall(L, 1, 1, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }
  ASSERT_STREQ("123", luaL_checkstring(L, -1));

  lua_close(L);

  SUCCEED();
}

TEST(Buffer, SetPointer) {
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  lua_open_buffer_libs(L);
  luaL_loadstring(L, "return "
                     "require('native_buffer')."
                     "new_buffer(8, { buffer_type = 'any' }), "
                     "require('native_buffer')."
                     "new_buffer(8, { buffer_type = 'unsafe_pointer' })");

  if (lua_pcall(L, 0, 2, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  luaL_checkudata(L, -1, "LUA_USERDATA_TYPE_BUFFER");
  luaL_checkudata(L, -2, "LUA_USERDATA_TYPE_BUFFER");

  auto a = lua_gettop(L);
  auto b = a - 1;

  lua_getfield(L, a, "set_pointer");
  lua_pushvalue(L, a);
  lua_pushinteger(L, 0);
  lua_pushvalue(L, b);
  lua_pushinteger(L, 0);
  if (lua_pcall(L, 4, 0, 0) != LUA_OK) {
    const char *s = lua_tostring(L, -1);
    FAIL() << "Script Error: " << s;
  }

  lua_close(L);

  SUCCEED();
}