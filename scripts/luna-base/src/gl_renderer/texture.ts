import * as _gl from "gl";
import { PngImage } from "../images/png_image";
import { uuid } from "../uuid";

interface TextureFields {
  id: string;
  image: PngImage;
}

interface TexturePrototype {}

export type Texture = TexturePrototype & TextureFields;

const materialPrototype: TexturePrototype = {};

const imageMetatable = {
  __index: materialPrototype,
  __name: "LUA_TYPE_TEXTURE",
  __gc: function (this: Texture) {},
};

export function createTexture(this: void, image: PngImage): Texture {
  const fields: TextureFields = { id: uuid.v4(), image };
  const o = setmetatable(fields, imageMetatable) as Texture;
  return o;
}
