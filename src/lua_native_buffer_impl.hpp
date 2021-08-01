#ifndef __LUA_LUA_BUFFER_IMPL_HPP__
#define __LUA_LUA_BUFFER_IMPL_HPP__

#include <cstdint>

#include "lua_common.hpp"

enum BufferType {
  ANY_TYPE,
  UNSAFE_POINTER_TYPE,
};

struct Buffer {
  std::uint8_t *p;
  std::int32_t len;
  BufferType type;
};

Buffer *lua_native_buffer(lua_State *L, size_t len,
                          BufferType type = BufferType::ANY_TYPE,
                          bool zero_clear = false);

extern const char *LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME;

#endif
