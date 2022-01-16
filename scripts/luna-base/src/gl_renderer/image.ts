import { NativeBuffer } from "native_buffer";
import { createPngImage, isPngImage, PngImage } from "../images/png_image";
import { allocTableName, createTable, getMetatableName } from "../tables";

const TABLE_NAME = allocTableName("LUA_TYPE_IMAGE");

interface ImageFieldBase {
  path?: string;
  status: "complete" | "error" | "progress" | "ready";
}

interface UnknownImageField extends ImageFieldBase {
  type: "unknown";
}

interface PngImageField extends ImageFieldBase {
  type: "png";
  status: "complete";
  png: PngImage;
}

type ImageField = PngImageField | UnknownImageField;

interface ImagePrototype {
  setup(this: Image): boolean;
  getBuffer(this: Image): NativeBuffer | null;
  getWidth(this: Image): number | null;
  getHeight(this: Image): number | null;
  getChannels(this: Image): number | null;
  getBitDepth(this: Image): number | null;
}

export type Image = ImageField & ImagePrototype;

const prototype: ImagePrototype = {
  setup() {
    if (this.status !== "ready" || this.path == null) {
      return false;
    }

    this.status = "progress";
    const result = createPngImage(this.path);
    if (!isPngImage(result)) {
      this.status = "error";
      return false;
    }

    Object.assign(this, { status: "complete", type: "png", png: result });

    return true;
  },
  getWidth() {
    if (this.type === "png") {
      return this.png.width;
    }

    return null;
  },
  getHeight() {
    if (this.type === "png") {
      return this.png.height;
    }

    return null;
  },
  getChannels() {
    if (this.type === "png") {
      return this.png.channels;
    }

    return null;
  },
  getBitDepth() {
    if (this.type === "png") {
      return this.png.bit_depth;
    }

    return null;
  },
  getBuffer() {
    if (this.type === "png") {
      return this.png.buffer;
    }

    return null;
  },
};

export function createImage(this: void, path?: string): Image {
  const fields: ImageField = {
    path,
    type: "unknown",
    status: "ready",
  };
  const o = createTable(TABLE_NAME, fields, prototype);
  o.setup();
  return o;
}

export function isImage(this: void, x: unknown): x is Image {
  return getMetatableName(x) === TABLE_NAME;
}
