import { assertIsFalsy } from "./type_utils";

export type TableName =
  | "LUA_TYPE_APPLICATION_TASK"
  | "LUA_TYPE_GEOMETRY_TASK"
  | "LUA_TYPE_GEOMETRY"
  | "LUA_TYPE_GL_PROGRAM"
  | "LUA_TYPE_GL_RENDERER_TASK"
  | "LUA_TYPE_GL_RENDERER"
  | "LUA_TYPE_GL_TEXTURE"
  | "LUA_TYPE_GL_VERTEX_ARRAY"
  | "LUA_TYPE_IMAGE_TASK"
  | "LUA_TYPE_IMAGE"
  | "LUA_TYPE_MATERIAL_TASK"
  | "LUA_TYPE_MATERIAL"
  | "LUA_TYPE_MESH_TASK"
  | "LUA_TYPE_NODE"
  | "LUA_TYPE_PNG_IMAGE"
  | "LUA_TYPE_SHADER_PROGRAM_TASK"
  | "LUA_TYPE_SHADER_PROGRAM"
  | "LUA_TYPE_SHADER_TASK"
  | "LUA_TYPE_SHADER"
  | "LUA_TYPE_SUB_MESH_TASK"
  | "LUA_TYPE_SUB_MESH"
  | "LUA_TYPE_TEXT_TASK"
  | "LUA_TYPE_TEXTURE_IMAGE_TASK"
  | "LUA_TYPE_TEXTURE"
  | "LUA_TYPE_TRANSFORM_TASK"
  | "LUA_TYPE_TRANSFORM"
  | "LUA_TYPE_VEC4_TASK"
  | "LUA_USERADD_GL_BUFFER"
  | "LUA_USERDATA_GL_BUFFER"
  | "LUA_USERDATA_TYPE_BUFFER";

const globalTableNames: TableName[] = [];

export function allocTableName<T extends TableName>(this: void, tableName: T) {
  assertIsFalsy(globalTableNames.includes(tableName));
  return tableName;
}

export function createTable<T1, T2>(
  this: void,
  tableName: TableName | null,
  fields: T1 | null,
  prototype?: T2 | null,
  __gc?: (this: T1 & T2) => void
) {
  const metatable = {
    __index: prototype,
    __name: tableName,
    __gc,
  };
  return setmetatable(fields as any, metatable as any) as T1 & T2;
}

export function getMetatableName(this: void, x: unknown): TableName {
  return (getmetatable(x) as { __name: string } | null)?.__name as TableName;
}
