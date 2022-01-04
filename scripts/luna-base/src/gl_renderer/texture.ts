import * as _gl from "gl";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { Image } from "./image";
import { NodeTaskId } from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXTURE");

export type TextureId = string & { __texture: never };

interface TextureFields {
  id: TextureId;
  imageTaskId: NodeTaskId;
}

interface TexturePrototype {}

export type Texture = TexturePrototype & TextureFields;

const prototype: TexturePrototype = {};

export function createTexture(this: void, imageTaskId: NodeTaskId): Texture {
  const fields: TextureFields = { id: uuid.v4() as TextureId, imageTaskId };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isTexture(this: void, x: unknown): x is Texture {
  return getMetatableName(x) === TABLE_NAME;
}
