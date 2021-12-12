import * as _gl from "gl";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { Image } from "./image";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXTURE");

interface TextureFields {
  id: string;
  image: Image;
}

interface TexturePrototype {}

export type Texture = TexturePrototype & TextureFields;

const prototype: TexturePrototype = {};

export function createTexture(this: void, image: Image): Texture {
  const fields: TextureFields = { id: uuid.v4(), image };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isTexture(this: void, x: unknown): x is Texture {
  return getMetatableName(x) === TABLE_NAME;
}