import * as _gl from "gl";
import { NativeBuffer } from "native_buffer";
import * as _png from "png";

interface PngImageFields
  extends Omit<ReturnType<typeof _png.load_from_file>, "buffer"> {
  buffer: NativeBuffer;
}

interface PngImagePrototype {}

export type PngImage = PngImagePrototype & PngImageFields;

const imagePrototype: PngImagePrototype = {};

const imageMetatable = {
  __index: imagePrototype,
  __name: "LUA_TYPE_PNG_IMAGE",
  __gc: function (this: PngImage) {},
};

export function createPngImage(
  this: void,
  path: string
): [null, PngImage] | [string, null] {
  const openResult = io.open(path, "rb");
  if (openResult[0] == null) {
    const err = openResult[1];
    return [err, null];
  }

  const f = openResult[0];
  const o = setmetatable(
    _png.load_from_file(f) as any,
    imageMetatable
  ) as PngImage;
  f.close();
  return [null, o];
}
