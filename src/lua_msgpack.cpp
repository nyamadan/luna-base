#include "lua_msgpack.hpp"
#include <msgpack.h>

namespace {

const char *LUA_USERDATA_TYPE_MSGPACK_METATABLE_NAME =
    "LUA_USERDATA_TYPE_MSGPACK";

msgpack_zone g_mempool = {0};

void serialize_table_impl(lua_State *L, int idx, msgpack_packer *pk) {
  int type = lua_type(L, idx);
  switch (type) {
  case LUA_TNUMBER: {
    if (lua_isinteger(L, idx)) {
      msgpack_pack_int32(pk, (int32_t)lua_tointeger(L, idx));
    } else {
      msgpack_pack_double(pk, lua_tonumber(L, idx));
    }
    break;
  }
  case LUA_TBOOLEAN: {
    if (lua_toboolean(L, idx)) {
      msgpack_pack_true(pk);
    } else {
      msgpack_pack_false(pk);
    }
    break;
  }
  case LUA_TSTRING: {
    const char *str = lua_tostring(L, idx);
    const size_t len = strlen(str);
    msgpack_pack_str_with_body(pk, str, len);
    break;
  }
  case LUA_TNIL: {
    msgpack_pack_nil(pk);
    break;
  }
  case LUA_TTABLE: {
    lua_pushnil(L);
    int len2 = 0;
    while (lua_next(L, idx) != 0) {
      len2++;
      lua_pop(L, 1);
    }

    msgpack_pack_map(pk, len2);

    lua_pushnil(L);
    while (lua_next(L, idx) != 0) {
      int type = lua_type(L, -2);

      switch (type) {
      case LUA_TSTRING: {
        const char *str = lua_tostring(L, -2);
        const size_t len = strlen(str);
        msgpack_pack_str_with_body(pk, str, len);
        break;
      }
      case LUA_TNUMBER: {
        if (lua_isinteger(L, -2)) {
          msgpack_pack_int32(pk, (int32_t)lua_tointeger(L, -2));
        } else {
          msgpack_pack_double(pk, lua_tonumber(L, -2));
        }
        break;
      }
      default: {
        break;
      }
      }

      serialize_table_impl(L, lua_gettop(L), pk);

      lua_pop(L, 1);
    }
    break;
  }
  default:
    break;
  }
}

int L_new_msgpack_buffer(lua_State *L) {
  msgpack_packer *ppk =
      (msgpack_packer *)lua_newuserdata(L, sizeof(msgpack_packer));
  msgpack_packer_init(ppk, msgpack_sbuffer_new(), msgpack_sbuffer_write);
  luaL_getmetatable(L, LUA_USERDATA_TYPE_MSGPACK_METATABLE_NAME);
  lua_setmetatable(L, -2);
  return 1;
}

int L_free_msgpack_buffer(lua_State *L) {
  msgpack_packer *ppk = (msgpack_packer *)luaL_checkudata(
      L, 1, LUA_USERDATA_TYPE_MSGPACK_METATABLE_NAME);
  luaL_argcheck(L, ppk != NULL, 1, "LUA_USERDATA_TYPE_MSGPACK expected");

  msgpack_sbuffer_free((msgpack_sbuffer *)ppk->data);
  ppk->data = NULL;

  return 0;
}

int L_serialize_table(lua_State *L) {
  msgpack_packer *ppk = (msgpack_packer *)luaL_checkudata(
      L, 1, LUA_USERDATA_TYPE_MSGPACK_METATABLE_NAME);
  luaL_argcheck(L, ppk != NULL, 1, "LUA_USERDATA_TYPE_MSGPACK expected");
  luaL_argcheck(L, ppk->data != NULL, 1, "already free?");
  luaL_checkany(L, 2);
  serialize_table_impl(L, 2, ppk);
  return 0;
}

int L_dump(lua_State *L) {
  msgpack_packer *ppk = (msgpack_packer *)luaL_checkudata(
      L, 1, LUA_USERDATA_TYPE_MSGPACK_METATABLE_NAME);
  luaL_argcheck(L, ppk != NULL, 1, "LUA_USERDATA_TYPE_MSGPACK expected");
  luaL_argcheck(L, ppk->data != NULL, 1, "already free?");

  msgpack_sbuffer *sbuf = (msgpack_sbuffer *)ppk->data;
  msgpack_object deserialized;
  msgpack_unpack(sbuf->data, sbuf->size, NULL, &g_mempool, &deserialized);
  msgpack_object_print(stdout, deserialized);
  fwrite("\n", sizeof(char), 1, stdout);
  fflush(stdout);

  return 0;
}

int L_require(lua_State *L) {
  msgpack_zone_init(&g_mempool, 2048);

  luaL_newmetatable(L, LUA_USERDATA_TYPE_MSGPACK_METATABLE_NAME);
  lua_pushcfunction(L, L_free_msgpack_buffer);
  lua_setfield(L, -2, "__gc");
  lua_newtable(L);
  lua_pushcfunction(L, L_free_msgpack_buffer);
  lua_setfield(L, -2, "free");
  lua_pushcfunction(L, L_serialize_table);
  lua_setfield(L, -2, "serialize");
  lua_pushcfunction(L, L_dump);
  lua_setfield(L, -2, "dump");
  lua_setfield(L, -2, "__index");

  lua_newtable(L);
  lua_pushcfunction(L, L_new_msgpack_buffer);
  lua_setfield(L, -2, "new_msgpack_buffer");
  return 1;
}
} // namespace

void lua_open_msgpack_libs(lua_State *L) {
  luaL_requiref(L, "msgpack", L_require, false);
}
