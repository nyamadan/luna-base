
#include "lua_native_buffer_impl.hpp"
#include "lua_utils.hpp"

#include <cstdint>
#include <png.h>

namespace {
int L_load_from_file(lua_State *L) {
  luaL_Stream *file = (luaL_Stream *)luaL_checkudata(L, 1, LUA_FILEHANDLE);
  luaL_argcheck(L, file != NULL, 1, "LUA_FILEHANDLE expected");
  luaL_argcheck(L, file->f != NULL, 1, "LUA_FILEHANDLE: not opened yet?");
  luaL_argcheck(L, file->closef != NULL, 1, "LUA_FILEHANDLE: already closed?");

  FILE *fp = file->f;

  png_structp png =
      png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
  if (!png) {
    luaL_error(L, "error: png_create_read_struct");
  }

  png_infop info = png_create_info_struct(png);
  if (!info) {
    png_destroy_read_struct(&png, NULL, NULL);
    luaL_error(L, "error: png_create_info_struct");
  }

  if (setjmp(png_jmpbuf(png))) {
    png_destroy_read_struct(&png, &info, NULL);
    luaL_error(L, "error: setjmp(png_jmpbuf(png))");
  }

  png_init_io(png, fp);
  png_read_info(png, info);

  std::uint32_t width = png_get_image_width(png, info);
  std::uint32_t height = png_get_image_height(png, info);
  std::uint8_t color_type = png_get_color_type(png, info);
  std::uint8_t bit_depth = png_get_bit_depth(png, info);
  std::uint8_t channels = png_get_channels(png, info);

  lua_newtable(L);
  lua_pushinteger(L, width);
  lua_setfield(L, -2, "width");

  lua_pushinteger(L, height);
  lua_setfield(L, -2, "height");

  lua_pushinteger(L, color_type);
  lua_setfield(L, -2, "color_type");

  lua_pushinteger(L, bit_depth);
  lua_setfield(L, -2, "bit_depth");

  lua_pushinteger(L, channels);
  lua_setfield(L, -2, "channels");

  std::uint32_t stride = width * bit_depth * channels / 8;

  Buffer *data = lua_native_buffer(L, height * stride);

  std::uint32_t offset_point = height * stride;
  for (std::uint32_t i = 0; i < height; i++) {
    offset_point -= stride;
    png_read_row(png, data->p + offset_point, NULL);
  }

  lua_setfield(L, -2, "buffer");

  png_destroy_read_struct(&png, &info, NULL);

  return 1;
}

int L_require(lua_State *L) {
  lua_newtable(L);

  lua_pushcfunction(L, L_load_from_file);
  lua_setfield(L, -2, "load_from_file");

  return 1;
}

} // namespace

void lua_open_png_libs(lua_State *L) {
  luaL_requiref(L, "png", L_require, false);
}
