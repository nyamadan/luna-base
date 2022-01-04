import * as _gl from "gl";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { Shader } from "./shader";

const TABLE_NAME = allocTableName("LUA_TYPE_SHADER_PROGRAM");

export type ShaderProgramId = string & { __shader_program: never };

interface ShaderProgramField {
  guid: ShaderProgramId;
  vertexShader: Shader;
  fragmentShader: Shader;
}

interface ShaderProgramPrototype {}

export type ShaderProgram = ShaderProgramPrototype & ShaderProgramField;

const prototype: ShaderProgramPrototype = {};

export function createShaderProgram(
  this: void,
  vertexShader: Shader<"VERTEX_SHADER">,
  fragmentShader: Shader<"FRAGMENT_SHADER">
): ShaderProgram {
  const field: ShaderProgramField = {
    guid: uuid.v4() as ShaderProgramId,
    vertexShader,
    fragmentShader,
  };
  return createTable(TABLE_NAME, field, prototype);
}

export function isShaderProgram(this: void, x: unknown): x is ShaderProgram {
  return getMetatableName(x) === TABLE_NAME;
}
