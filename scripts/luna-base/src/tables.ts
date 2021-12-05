import { assertIsFalsy } from "./type_utils";

export type TableName = "LUA_TYPE_TRANSFORM" | "LUA_TYPE_TRANSFORM_TASK";

const globalTableNames: TableName[] = [];

export function allocTableName<T extends TableName>(this: void, tableName: T) {
  assertIsFalsy(globalTableNames.includes(tableName));
  return tableName;
}

export function createTable<T1, T2>(
  this: void,
  tableName: TableName,
  fields: T1,
  prototype: T2,
  __gc?: (this: T1 & T2) => void
) {
  const metatable = {
    __index: prototype,
    __name: tableName,
    __gc,
  };
  return setmetatable(fields as any, metatable as any) as T1 & T2;
}
