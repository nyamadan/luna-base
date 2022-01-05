import * as _gl from "gl";
import { Material } from "./material";
import { uuid } from "../uuid";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { NodeTaskId } from "./node_task";
import { GeometryTaskType } from "./geometry_task";

const TABLE_NAME = allocTableName("LUA_TYPE_SUB_MESH");

export type SubMeshId = string & { __subMesh: never };

interface SubMeshFields {
  guid: SubMeshId;
  material: Material;
  geometryTaskGuid: GeometryTaskType["guid"];
}

interface SubMeshPrototype {}

export type SubMesh = SubMeshPrototype & SubMeshFields;

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
