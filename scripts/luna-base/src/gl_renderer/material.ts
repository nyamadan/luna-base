import * as _gl from "gl";
import { allocTableName, createTable } from "../tables";
import { uuid } from "../uuid";
import { Texture } from "./texture";

const TABLE_NAME = allocTableName("LUA_TYPE_MATERIAL");

interface MaterialFields {
  id: string;
  program: {
    name: string;
  };
  texture: Texture | null;
}

interface MaterialPrototype {}

export type Material = MaterialPrototype & MaterialFields;

const prototype: MaterialPrototype = {};

export function createMaterial(
  this: void,
  programName: string,
  texture?: Texture
): Material {
  const fields: MaterialFields = {
    id: uuid.v4(),
    program: { name: programName },
    texture: texture ?? null,
  };
  return createTable(TABLE_NAME, fields, prototype);
}
