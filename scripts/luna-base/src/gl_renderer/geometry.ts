import { F32Array } from "../buffers/f32array";
import { U16Array } from "../buffers/u16array";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { createGeometryBuffer, GeometryBufferType } from "./geometry_buffer";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY");

export interface GeometryFields {
  guid: string;
  positions: GeometryBufferType<F32Array>;
  colors: GeometryBufferType<F32Array>;
  uv0s: GeometryBufferType<F32Array>;
  normals: GeometryBufferType<F32Array>;
  indices: GeometryBufferType<U16Array>;
}

export interface GeometryPrototype {}

export interface GeometryType extends GeometryFields, GeometryPrototype {}

const prototype: GeometryPrototype = {};

export function createGeometry(
  this: void,
  params: Partial<Omit<GeometryFields, "guid">> = {}
) {
  const fields: GeometryFields = {
    guid: uuid.v4(),
    colors: params.colors ?? createGeometryBuffer<F32Array>(),
    indices: params.indices ?? createGeometryBuffer<U16Array>(),
    positions: params.positions ?? createGeometryBuffer<F32Array>(),
    uv0s: params.uv0s ?? createGeometryBuffer<F32Array>(),
    normals: params.normals ?? createGeometryBuffer<F32Array>(),
  };

  return createTable(TABLE_NAME, fields, prototype);
}

export function isGeometryType(this: void, x: unknown): x is GeometryType {
  return getMetatableName(x) === TABLE_NAME;
}
