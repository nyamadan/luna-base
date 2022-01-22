import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { Material } from "./material";
import { GeometryTaskType } from "./tasks/geometry_task";

const TABLE_NAME = allocTableName("LUA_TYPE_SUB_MESH");

export type SubMeshId = string & { __subMesh: never };

interface SubMeshFields {
  guid: SubMeshId;
  material: Material;
  geometryTaskGuid: GeometryTaskType["guid"];
}

interface SubMeshPrototype {}

export type SubMesh = SubMeshFields & SubMeshPrototype;

const prototype: SubMeshPrototype = {};

export function createSubMesh(
  this: void,
  params: Omit<SubMeshFields, "guid">
): SubMesh {
  const fields: SubMeshFields = {
    ...params,
    ...{ guid: uuid.v4() as SubMeshId },
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isSubMesh(this: void, x: unknown): x is SubMesh {
  return getMetatableName(x) === TABLE_NAME;
}
