import { NativeBuffer } from "native_buffer";
import * as _png from "png";
import { allocTableName, createTable, getMetatableName } from "../tables";

const TABLE_NAME = allocTableName("LUA_TYPE_PNG_IMAGE");

interface PngImageFields
  extends Omit<ReturnType<typeof _png.load_from_file>, "buffer"> {
  buffer: NativeBuffer;
}

interface PngImagePrototype {}

export type PngImage = PngImagePrototype & PngImageFields;

const prototype: PngImagePrototype = {};

export function createPngImage(this: void, path: string): PngImage | string {
  const openResult = io.open(path, "rb");
  if (openResult[0] == null) {
    const err = openResult[1];
    return err;
  }

  const f = openResult[0];

  const o = createTable(
    TABLE_NAME,
    _png.load_from_file(f) as PngImage,
    prototype
  );
  f.close();

  return o;
}

export function isPngImage(this: void, x: unknown): x is PngImage {
  return getMetatableName(x) === TABLE_NAME;
}
