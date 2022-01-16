import { F32Array } from "../buffers/f32array";
import { U16Array } from "../buffers/u16array";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY");

export interface GeometryFields {
  guid: string;
  positions: F32Array | number[] | null;
  colors: F32Array | number[] | null;
  uv0s: F32Array | number[] | null;
  normals: F32Array | number[] | null;
  indices: number[] | U16Array | null;
}

export interface GeometryPrototype {}

export type Geometry = GeometryFields & GeometryPrototype;

const prototype: GeometryPrototype = {};

export function createGeometry(
  this: void,
  params: Partial<Omit<GeometryFields, "guid">> = {}
) {
  const fields: GeometryFields = {
    guid: uuid.v4(),
    colors: null,
    indices: null,
    positions: null,
    uv0s: null,
    normals: null,
    ...params,
  };

  return createTable(TABLE_NAME, fields, prototype);
}

export function isGeometry(this: void, x: unknown): x is Geometry {
  return getMetatableName(x) === TABLE_NAME;
}
