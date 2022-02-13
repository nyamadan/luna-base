import { NativeArray } from "../buffers/native_array";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY_BUFFER");

export interface GeometryBufferFields<T extends NativeArray> {
  guid: string;
  buffer: number[] | T;
  usage: "dynamic" | "static";
}

export interface GeometryBufferPrototype {}

export interface GeometryBufferType<T extends NativeArray>
  extends GeometryBufferFields<T>,
    GeometryBufferPrototype {}

const prototype: GeometryBufferPrototype = {};

export function createGeometryBuffer<T extends NativeArray>(
  this: void,
  params: Partial<Omit<GeometryBufferFields<T>, "guid">> = {}
) {
  const fields: GeometryBufferFields<T> = {
    guid: uuid.v4(),
    buffer: [],
    usage: "static",
    ...params,
  };

  return createTable(TABLE_NAME, fields, prototype);
}

export function isGeometryBufferType(
  this: void,
  x: unknown
): x is GeometryBufferType<NativeArray> {
  return getMetatableName(x) === TABLE_NAME;
}
