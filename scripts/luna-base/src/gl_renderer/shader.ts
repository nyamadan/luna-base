import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";

const TABLE_NAME = allocTableName("LUA_TYPE_SHADER");

export type ShaderId = string & { __shader_program: never };

export type ShaderType = "FRAGMENT_SHADER" | "VERTEX_SHADER";

interface ShaderField<T extends ShaderType> {
  guid: ShaderId;
  type: T;
  source: string;
}

interface ShaderPrototype {}

export type Shader<T extends ShaderType = ShaderType> = ShaderField<T> &
  ShaderPrototype;

const prototype: ShaderPrototype = {};

export function createShader<T extends ShaderType>(
  this: void,
  type: T,
  source: string
): Shader<T> {
  const field: ShaderField<T> = {
    guid: uuid.v4() as ShaderId,
    type,
    source,
  };
  return createTable(TABLE_NAME, field, prototype);
}

export function isShader(this: void, x: unknown): x is Shader {
  return getMetatableName(x) === TABLE_NAME;
}
