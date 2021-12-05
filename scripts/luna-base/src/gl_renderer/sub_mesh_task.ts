import * as _gl from "gl";
import { allocTableName, createTable } from "../tables";
import { getMetatableName } from "../type_utils";
import { uuid } from "../uuid";
import { NodeTaskField, NodeTaskId, NodeTaskPrototype } from "./node";
import { SubMesh } from "./sub_mesh";

const TABLE_NAME = allocTableName("LUA_TYPE_SUB_MESH_TASK");

interface SubMeshTaskField extends NodeTaskField {
  id: NodeTaskId;
  subMesh: SubMesh;
}

interface SubMeshTaskPrototype extends NodeTaskPrototype<SubMeshTask> {}

export type SubMeshTask = SubMeshTaskPrototype & SubMeshTaskField;

const prototype: SubMeshTaskPrototype = {
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      default: {
        return state;
      }
    }
  },
};

export function createSubMeshTask(this: void, subMesh: SubMesh) {
  const fields: SubMeshTaskField = { id: uuid.v4() as NodeTaskId, subMesh };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isSubMeshTask(this: void, x: unknown): x is SubMeshTask {
  return getMetatableName(x) === TABLE_NAME;
}
