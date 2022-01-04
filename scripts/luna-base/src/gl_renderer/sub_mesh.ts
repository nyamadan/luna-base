import * as _gl from "gl";
import { Geometry } from "./geometry";
import { Material } from "./material";
import { uuid } from "../uuid";
import { allocTableName, createTable, getMetatableName } from "../tables";

const TABLE_NAME = allocTableName("LUA_TYPE_SUB_MESH");

export type SubMeshId = string & { __subMesh: never };

interface SubMeshFields {
  guid: SubMeshId;
  material: Material;
  geometry: Geometry;
}

interface SubMeshPrototype {}

export type SubMesh = SubMeshPrototype & SubMeshFields;

const prototype: SubMeshPrototype = {};

export function createSubMesh(
  this: void,
  geometry: Geometry,
  material: Material
): SubMesh {
  const fields: SubMeshFields = {
    guid: uuid.v4() as SubMeshId,
    geometry,
    material,
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isSubMesh(this: void, x: unknown): x is SubMesh {
  return getMetatableName(x) === TABLE_NAME;
}
