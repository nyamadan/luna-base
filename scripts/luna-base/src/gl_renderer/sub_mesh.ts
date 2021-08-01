import * as _gl from "gl";
import { Geometry } from "./geometry";
import { Material } from "./material";
import { uuid } from "../uuid";

interface SubMeshFields {
  id: string;
  material: Material;
  geometry: Geometry;
}

interface SubMeshPrototype {}

export type SubMesh = SubMeshPrototype & SubMeshFields;

const prototype: SubMeshPrototype = {};

const metatable = {
  __index: prototype,
  __name: "LUA_TYPE_SUB_MESH",
  __gc: function (this: SubMesh) {},
};

export function createSubMesh(this: void, geometry: Geometry, material: Material) {
  const fields: SubMeshFields = { id: uuid.v4(), geometry, material };
  const o = setmetatable(fields, metatable) as SubMesh;

  return o;
}
