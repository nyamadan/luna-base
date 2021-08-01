#include "lua_native_buffer.hpp"

#include <algorithm>
#include <cfloat>
#include <cstdint>
#include <cstdlib>
#include <cstring>

#include "lua_native_buffer_impl.hpp"

const char *LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME =
    "LUA_USERDATA_TYPE_BUFFER";

namespace {

int L_new_null_pointer(lua_State *L) {
  Buffer *data = (Buffer *)lua_newuserdata(L, sizeof(Buffer));
  data->p = nullptr;
  data->type = UNSAFE_POINTER_TYPE;
  data->len = 0;
  luaL_getmetatable(L, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  lua_setmetatable(L, -2);
  return 1;
}

int L_new_buffer(lua_State *L) {
  lua_Integer len = luaL_checkinteger(L, 1);
  luaL_argcheck(L, len > 0, 1, "len > 0");

  BufferType t = BufferType::ANY_TYPE;
  bool zero_clear = false;
  if (lua_istable(L, 2)) {
    lua_getfield(L, 2, "buffer_type");
    if (lua_isstring(L, -1)) {
      const char *str = luaL_checkstring(L, -1);

      if (std::strcmp("unsafe_pointer", str) == 0) {
        t = BufferType::UNSAFE_POINTER_TYPE;
      } else if (std::strcmp("any", str) == 0) {
        t = BufferType::ANY_TYPE;
      }
    }

    lua_getfield(L, 2, "zero_clear");
    zero_clear = lua_toboolean(L, -1);
  }

  lua_native_buffer(L, len, t, zero_clear);
  return 1;
}

int L_copy_buffer(lua_State *L) {
  Buffer *dst =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, dst != NULL, 1, "dst: LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, dst->p != NULL, 1,
                "dst: LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, dst->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "dst: LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer dst_offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, dst->len > dst_offset && dst_offset >= 0, 2,
                "dst: invalid index");

  Buffer *src =
      (Buffer *)luaL_checkudata(L, 3, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, src != NULL, 3, "src: LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, src->p != NULL, 3,
                "src: LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, src->type != BufferType::UNSAFE_POINTER_TYPE, 3,
                "src: LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer src_offset = luaL_checkinteger(L, 4);
  luaL_argcheck(L, src->len > src_offset && src_offset >= 0, 4,
                "src: invalid index");
  lua_Integer size = luaL_checkinteger(L, 5);

  luaL_argcheck(L, dst_offset + size < dst->len, 5, "dst: too large size");
  luaL_argcheck(L, src_offset + size < src->len, 5, "src: too large size");

  std::memmove(((std::uint8_t *)dst->p) + dst_offset,
               ((std::uint8_t *)src->p) + src_offset, size);

  return 0;
}

int L_length(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");

  lua_pushinteger(L, data->len);

  return 1;
}
int L_set_string(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  std::size_t str_len = 0;
  const char *str = luaL_checklstring(L, 2, &str_len);

  std::size_t len = std::min(str_len, (std::size_t)data->len);

  if (len < data->len) {
    data->p[len] = '\0';
  }

  if (len > 0) {
    std::memcpy(data->p, str, len);
  }

  lua_pushinteger(L, (std::int32_t)len);

  return 1;
}

int L_get_string(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  const std::size_t str_len = ::strnlen((const char *)data->p, data->len);
  lua_pushlstring(L, (const char *)data->p, str_len);

  return 1;
}

int L_set_bool(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + sizeof(bool) <= data->len, 2,
                "invalid offset");
  bool n = lua_toboolean(L, 3) ? true : false;

  std::uint8_t *p = (std::uint8_t *)data->p;
  *(bool *)(p + offset) = n;

  return 0;
}

int L_get_bool(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + sizeof(bool) <= data->len, 2,
                "invalid offset");
  std::uint8_t *p = (std::uint8_t *)data->p;
  lua_pushboolean(L, *(bool *)(p + offset));
  return 1;
}

int L_set_uint8(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 1 <= data->len, 2, "invalid offset");
  lua_Integer n = luaL_checkinteger(L, 3);

  std::uint8_t *p = (std::uint8_t *)data->p;
  *(std::uint8_t *)(p + offset) = static_cast<std::uint8_t>(n);

  return 0;
}

int L_get_uint8(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 1 <= data->len, 2, "invalid offset");
  std::uint8_t *p = (std::uint8_t *)data->p;
  lua_pushinteger(L, *(std::uint8_t *)(p + offset));
  return 1;
}

int L_set_uint16(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 2 <= data->len, 2, "invalid offset");
  lua_Integer n = luaL_checkinteger(L, 3);

  std::uint8_t *p = (std::uint8_t *)data->p;
  *(std::uint16_t *)(p + offset) = static_cast<std::uint16_t>(n);

  return 0;
}

int L_get_uint16(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 2 <= data->len, 2, "invalid offset");
  std::uint8_t *p = (std::uint8_t *)data->p;
  lua_pushinteger(L, *(std::uint16_t *)(p + offset));
  return 1;
}

int L_set_int8(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 1 <= data->len, 2, "invalid offset");
  lua_Integer n = luaL_checkinteger(L, 3);

  std::uint8_t *p = (std::uint8_t *)data->p;
  *(std::int8_t *)(p + offset) = static_cast<std::int8_t>(n);

  return 0;
}

int L_get_int8(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 1 <= data->len, 2, "invalid offset");
  std::uint8_t *p = (std::uint8_t *)data->p;
  lua_pushinteger(L, *(std::int8_t *)(p + offset));
  return 1;
}

int L_set_int16(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 2 <= data->len, 2, "invalid offset");
  lua_Integer n = luaL_checkinteger(L, 3);

  std::uint8_t *p = (std::uint8_t *)data->p;
  *(std::int16_t *)(p + offset) = static_cast<std::int16_t>(n);

  return 0;
}

int L_get_int16(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 2 <= data->len, 2, "invalid offset");
  std::uint8_t *p = (std::uint8_t *)data->p;
  lua_pushinteger(L, *(std::int16_t *)(p + offset));
  return 1;
}

int L_set_int32(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 4 <= data->len, 2, "invalid offset");
  lua_Integer n = luaL_checkinteger(L, 3);

  std::uint8_t *p = (std::uint8_t *)data->p;
  *(std::int32_t *)(p + offset) = static_cast<std::int32_t>(n);

  return 0;
}

int L_get_int32(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 4 <= data->len, 2, "invalid offset");
  std::uint8_t *p = (std::uint8_t *)data->p;
  lua_pushinteger(L, *(std::int32_t *)(p + offset));
  return 1;
}

int L_set_float32(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");
  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 4 <= data->len, 2, "invalid offset");
  lua_Number n = luaL_checknumber(L, 3);

  std::uint8_t *p = (std::uint8_t *)data->p;
  *(float *)(p + offset) = static_cast<float>(n);

  return 0;
}

int L_get_float32(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, data->p != NULL, 1,
                "LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, data->type != BufferType::UNSAFE_POINTER_TYPE, 1,
                "LUA_USERDATA_TYPE_BUFFER: UNSAFE_BUFFER_TYPE");

  lua_Integer offset = luaL_checkinteger(L, 2);
  luaL_argcheck(L, offset >= 0 && offset + 4 <= data->len, 2, "invalid offset");
  std::uint8_t *p = (std::uint8_t *)data->p;
  lua_pushnumber(L, *(float *)(p + offset));
  return 1;
}

int L_set_pointer(lua_State *L) {
  Buffer *dst =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, dst != NULL, 1, "dst: LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, dst->p != NULL, 1,
                "dst: LUA_USERDATA_TYPE_BUFFER: already free?");
  luaL_argcheck(L, dst->type == BufferType::UNSAFE_POINTER_TYPE, 1,
                "dst: LUA_USERDATA_TYPE_BUFFER: Require(UNSAFE_BUFFER_TYPE)");

  lua_Integer dst_offset = luaL_checkinteger(L, 2);
  luaL_argcheck(
      L, dst_offset >= 0 && dst_offset + sizeof(std::int32_t *) <= dst->len, 2,
      "dst: invalid offset");

  Buffer *src =
      (Buffer *)luaL_checkudata(L, 3, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, src != NULL, 3, "LUA_USERDATA_TYPE_BUFFER expected");
  luaL_argcheck(L, src->p != NULL, 3,
                "LUA_USERDATA_TYPE_BUFFER: already free?");

  lua_Integer src_offset = luaL_checkinteger(L, 4);
  luaL_argcheck(L, src_offset >= 0 && src_offset + 1 <= src->len, 4,
                "src: invalid offset");

  *(std::int32_t **)((std::uint8_t *)dst->p + dst_offset) =
      (std::int32_t *)((std::uint8_t *)src->p + src_offset);

  return 0;
}

int L_free(lua_State *L) {
  Buffer *data =
      (Buffer *)luaL_checkudata(L, 1, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  luaL_argcheck(L, data != NULL, 1, "LUA_USERDATA_TYPE_BUFFER expected");

  std::free(data->p);
  data->p = NULL;
  data->len = 0;

  return 0;
}

int L_require(lua_State *L) {
  luaL_newmetatable(L, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);

  lua_pushcfunction(L, L_free);
  lua_setfield(L, -2, "__gc");

  lua_pushcfunction(L, L_length);
  lua_setfield(L, -2, "__len");

  lua_newtable(L);

  lua_pushcfunction(L, L_free);
  lua_setfield(L, -2, "free");

  lua_pushcfunction(L, L_get_string);
  lua_setfield(L, -2, "get_string");

  lua_pushcfunction(L, L_set_string);
  lua_setfield(L, -2, "set_string");

  lua_pushcfunction(L, L_get_bool);
  lua_setfield(L, -2, "get_bool");

  lua_pushcfunction(L, L_set_bool);
  lua_setfield(L, -2, "set_bool");

  lua_pushcfunction(L, L_get_uint8);
  lua_setfield(L, -2, "get_uint8");

  lua_pushcfunction(L, L_set_uint8);
  lua_setfield(L, -2, "set_uint8");

  lua_pushcfunction(L, L_get_uint16);
  lua_setfield(L, -2, "get_uint16");

  lua_pushcfunction(L, L_set_uint16);
  lua_setfield(L, -2, "set_uint16");

  lua_pushcfunction(L, L_get_int8);
  lua_setfield(L, -2, "get_int8");

  lua_pushcfunction(L, L_set_int8);
  lua_setfield(L, -2, "set_int8");

  lua_pushcfunction(L, L_get_int16);
  lua_setfield(L, -2, "get_int16");

  lua_pushcfunction(L, L_set_int16);
  lua_setfield(L, -2, "set_int16");

  lua_pushcfunction(L, L_get_int32);
  lua_setfield(L, -2, "get_int32");

  lua_pushcfunction(L, L_set_int32);
  lua_setfield(L, -2, "set_int32");

  lua_pushcfunction(L, L_get_float32);
  lua_setfield(L, -2, "get_float32");

  lua_pushcfunction(L, L_set_float32);
  lua_setfield(L, -2, "set_float32");

  lua_pushcfunction(L, L_set_pointer);
  lua_setfield(L, -2, "set_pointer");

  lua_pushcfunction(L, L_copy_buffer);
  lua_setfield(L, -2, "copy_buffer");

  lua_setfield(L, -2, "__index");

  lua_newtable(L);
  lua_pushcfunction(L, L_new_buffer);
  lua_setfield(L, -2, "new_buffer");

  lua_pushcfunction(L, L_copy_buffer);
  lua_setfield(L, -2, "copy_buffer");

  lua_pushcfunction(L, L_set_pointer);
  lua_setfield(L, -2, "set_buffer_pointer");

  lua_pushinteger(L, sizeof(std::int32_t *));
  lua_setfield(L, -2, "SIZE_OF_POINTER");

  lua_pushinteger(L, sizeof(bool));
  lua_setfield(L, -2, "SIZE_OF_BOOL");

  lua_pushcfunction(L, L_new_null_pointer);
  lua_pcall(L, 0, 1, 0);
  lua_setfield(L, -2, "NULL");

  return 1;
}
} // namespace

Buffer *lua_native_buffer(lua_State *L, size_t len, BufferType type,
                          bool zero_clear) {
  Buffer *data = (Buffer *)lua_newuserdata(L, sizeof(Buffer));
  data->p = (std::uint8_t *)std::malloc(len);
  data->type = type;
  data->len = static_cast<std::int32_t>(len);
  if (zero_clear) {
    std::memset(data->p, 0, len);
  }

  luaL_getmetatable(L, LUA_USERDATA_TYPE_BUFFER_METATABLE_NAME);
  lua_setmetatable(L, -2);

  return data;
}

void lua_open_buffer_libs(lua_State *L) {
  luaL_requiref(L, "native_buffer", L_require, true);
}
