import { F32Array } from "../buffers/f32array";
import { U16Array } from "../buffers/u16array";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY");

interface GeometryFields {
  id: string;
  positions: F32Array | number[] | null;
  colors: F32Array | number[] | null;
  uv0s: F32Array | number[] | null;
  indices: U16Array | number[] | null;
}

interface GeometryPrototype {}

export type Geometry = GeometryPrototype & GeometryFields;

const prototype: GeometryPrototype = {};

export function createGeometry(
  this: void,
  params: Partial<Omit<GeometryFields, "id">> = {}
) {
  const fields: GeometryFields = {
    id: uuid.v4(),
    colors: null,
    indices: null,
    positions: null,
    uv0s: null,
    ...params,
  };

  return createTable(TABLE_NAME, fields, prototype);
}

export function isGeometry(this: void, x: unknown): x is Geometry {
  return getMetatableName(x) === TABLE_NAME;
}
