import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { ImageTaskType } from "./tasks/image_task";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXTURE");

export type TextureId = string & { __texture: never };

interface TextureFields {
  guid: TextureId;
  imageTaskGuid: ImageTaskType["guid"];
}

interface TexturePrototype {}

export type Texture = TextureFields & TexturePrototype;

const prototype: TexturePrototype = {};

export function createTexture(
  this: void,
  imageTaskGuid: ImageTaskType["guid"]
): Texture {
  const fields: TextureFields = { guid: uuid.v4() as TextureId, imageTaskGuid };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isTexture(this: void, x: unknown): x is Texture {
  return getMetatableName(x) === TABLE_NAME;
}
