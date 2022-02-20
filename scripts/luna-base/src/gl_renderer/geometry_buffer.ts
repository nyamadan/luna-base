import { NativeArray } from "../buffers/native_array";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY_BUFFER");

type GeometryBufferUsage = "dynamic" | "static";

type GeometryBufferId = string & { __geometry_buffer: never };

export interface GeometryBufferFields<T extends NativeArray> {
  guid: GeometryBufferId;
  buffer: number[] | T;
  usage: GeometryBufferUsage;
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
    guid: uuid.v4() as GeometryBufferId,
    buffer: [],
    usage: "static",
    ...params,
  };

  return createTable(TABLE_NAME, fields, prototype);
}

export function isGeometryBuffer(
  this: void,
  x: unknown
): x is GeometryBufferType<NativeArray> {
  return getMetatableName(x) === TABLE_NAME;
}
