import { allocTableName, createTable } from "../tables";
import { uuid } from "../uuid";
import { ShaderProgram } from "./shader_program";
import { Texture } from "./texture";

const TABLE_NAME = allocTableName("LUA_TYPE_MATERIAL");

type MaterialId = string & { __material: never };

type UniformValue = {
  type: "Texture";
  texture: Texture;
};

interface MaterialFields {
  guid: MaterialId;
  shaderProgram: ShaderProgram;
  uniformValues: Record<string, UniformValue>;
}

interface MaterialPrototype {}

export type Material = MaterialPrototype & MaterialFields;

const prototype: MaterialPrototype = {};

export function createMaterial(
  this: void,
  shaderProgram: ShaderProgram,
  uniformValues: Record<string, UniformValue> = {}
): Material {
  const fields: MaterialFields = {
    guid: uuid.v4() as MaterialId,
    shaderProgram,
    uniformValues,
  };
  return createTable(TABLE_NAME, fields, prototype);
}
