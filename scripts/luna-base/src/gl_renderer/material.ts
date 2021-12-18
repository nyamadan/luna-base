import * as _gl from "gl";
import { allocTableName, createTable } from "../tables";
import { uuid } from "../uuid";
import { ShaderProgram } from "./shader_program";
import { Texture } from "./texture";

const TABLE_NAME = allocTableName("LUA_TYPE_MATERIAL");

interface MaterialFields {
  id: string;
  shaderProgram: ShaderProgram;
  texture: Texture | null;
}

interface MaterialPrototype {}

export type Material = MaterialPrototype & MaterialFields;

const prototype: MaterialPrototype = {};

export function createMaterial(
  this: void,
  shaderProgram: ShaderProgram,
  texture?: Texture
): Material {
  const fields: MaterialFields = {
    id: uuid.v4(),
    shaderProgram,
    texture: texture ?? null,
  };
  return createTable(TABLE_NAME, fields, prototype);
}
