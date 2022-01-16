import { F32Vec4 } from "../buffers/f32array";
import { allocTableName, createTable } from "../tables";
import { uuid } from "../uuid";
import { ShaderProgram } from "./shader_program";
import { Texture } from "./texture";

const TABLE_NAME = allocTableName("LUA_TYPE_MATERIAL");

type MaterialId = string & { __material: never };

interface TextureUniformType {
  type: "Texture";
  texture: Texture;
}

interface Vec4UniformType {
  type: "Vec4";
  value: F32Vec4;
}

export type UniformValue = TextureUniformType | Vec4UniformType;

interface MaterialFields {
  guid: MaterialId;
  shaderProgram: ShaderProgram;
  uniformValues: Record<string, UniformValue>;
}

interface MaterialPrototype {}

export type Material = MaterialFields & MaterialPrototype;

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
