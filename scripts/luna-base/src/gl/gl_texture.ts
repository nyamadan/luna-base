import * as _gl from "gl";
import { new_buffer } from "native_buffer";
import { PngImage } from "../images/png_image";
import { assertIsNotNull } from "../type_utils";

interface GLTextureFields {
  target:
    | typeof _gl.TEXTURE_2D
    | typeof _gl.TEXTURE_3D
    | typeof _gl.TEXTURE_2D_ARRAY
    | typeof _gl.TEXTURE_CUBE_MAP;
  level: number;
  tex: number | null;
  min: typeof _gl.NEAREST | typeof _gl.LINEAR;
  mag: typeof _gl.NEAREST | typeof _gl.LINEAR;
  wrapS: typeof _gl.CLAMP_TO_EDGE | typeof _gl.REPEAT;
  wrapT: typeof _gl.CLAMP_TO_EDGE | typeof _gl.REPEAT;
  internalFormat: typeof _gl.RGBA | typeof _gl.RGB;
  format: typeof _gl.RGBA | typeof _gl.RGB;
  type: typeof _gl.UNSIGNED_BYTE;
  width: number;
  height: number;
}

interface GLTexturePrototype {
  bind: (this: GLTexture) => void;
  unbind: (this: GLTexture) => void;
  free: (this: GLTexture) => void;
}

export type GLTexture = GLTexturePrototype & GLTextureFields;

const GLTexturePrototype: GLTexturePrototype = {
  bind: function () {
    assertIsNotNull(this.tex);
    _gl.bindTexture(this.target, this.tex);
  },
  unbind: function () {
    _gl.bindTexture(this.target, 0);
  },
  free: function () {
    assertIsNotNull(this.tex);
    const pTex = new_buffer(4);
    pTex.set_int32(0, this.tex);
    _gl.deleteTextures(1, pTex);
    this.tex = null;
  },
};

const GLTextureMetatable = {
  __index: GLTexturePrototype,
  __name: "LUA_TYPE_GL_TEXTURE",
  __gc: function (this: GLTexture) {
    this.free();
  },
};

export function createGLTexture(
  this: void,
  data: PngImage,
  options?: Partial<Omit<GLTextureFields, "tex">>
): GLTexture | null {
  const o = setmetatable(
    {
      tex: null,
      target: _gl.TEXTURE_2D,
      min: _gl.LINEAR,
      mag: _gl.LINEAR,
      internalFormat: _gl.RGB,
      format: _gl.RGB,
      type: _gl.UNSIGNED_BYTE,
      wrapS: _gl.CLAMP_TO_EDGE,
      wrapT: _gl.CLAMP_TO_EDGE,
      level: 0,
      width: 0,
      height: 0,
    } as GLTextureFields,
    GLTextureMetatable
  ) as GLTexture;

  // 8bit, 3channel, rgb
  if (data.bit_depth !== 8 || data.channels !== 3 || data.color_type !== 2) {
    return null;
  }

  o.width = data.width;
  o.height = data.height;

  if (data.width * data.height * data.channels !== data.buffer.length) {
    return null;
  }

  Object.assign(o, options);

  const pTex = new_buffer(4);
  _gl.genTextures(1, pTex);
  const tex = pTex.get_int32(0);
  _gl.bindTexture(o.target, tex);

  _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, 4);
  _gl.pixelStorei(_gl.UNPACK_ROW_LENGTH, 0);
  _gl.pixelStorei(_gl.UNPACK_IMAGE_HEIGHT, 0);
  _gl.pixelStorei(_gl.UNPACK_SKIP_PIXELS, 0);
  _gl.pixelStorei(_gl.UNPACK_SKIP_ROWS, 0);
  _gl.pixelStorei(_gl.UNPACK_SKIP_IMAGES, 0);

  _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, 1);

  _gl.texImage2D(
    o.target,
    o.level,
    o.internalFormat,
    o.width,
    o.height,
    0,
    o.format,
    o.type,
    data.buffer
  );

  _gl.texParameteri(o.target, _gl.TEXTURE_MAG_FILTER, o.mag);
  _gl.texParameteri(o.target, _gl.TEXTURE_MIN_FILTER, o.min);
  _gl.texParameteri(o.target, _gl.TEXTURE_WRAP_S, o.wrapS);
  _gl.texParameteri(o.target, _gl.TEXTURE_WRAP_T, o.wrapT);
  _gl.bindTexture(o.target, 0);
  o.tex = tex;
  return o;
}
