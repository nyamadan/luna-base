import { F32Array } from "../buffers/f32array";
import { U16Array } from "../buffers/u16array";
import { uuid } from "../uuid";

interface GeometryFields {
  id: string;
  positions: F32Array | number[] | null;
  colors: F32Array | number[] | null;
  uv0s: F32Array | number[] | null;
  indices: U16Array | number[] | null;
}

interface GeometryPrototype {}

export type Geometry = GeometryPrototype & GeometryFields;

const geometryPrototype: GeometryPrototype = {};

const imageMetatable = {
  __index: geometryPrototype,
  __name: "LUA_TYPE_GEOMETRY",
  __gc: function (this: Geometry) {},
};

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
  const o = setmetatable(fields, imageMetatable) as Geometry;

  return o;
}
