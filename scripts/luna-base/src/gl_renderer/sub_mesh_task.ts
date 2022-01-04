import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import {
  createTask,
  NodeTaskField,
  NodeTaskPrototype,
  NodeTaskType,
  NodeTaskTypeOptionalField,
} from "./node_task";
import { SubMesh } from "./sub_mesh";

const TABLE_NAME = allocTableName("LUA_TYPE_SUB_MESH_TASK");

export interface SubMeshTaskField extends NodeTaskField {
  subMesh: SubMesh | null;
}

export interface SubMeshTaskPrototype
  extends NodeTaskPrototype<SubMeshTaskType> {}

export type SubMeshTaskType = SubMeshTaskPrototype & SubMeshTaskField;

const prototype: SubMeshTaskPrototype = {
  run: function (command, state) {
    const { name, node } = command;
    switch (name) {
      case "setup": {
        if (this.subMesh != null) {
          return state;
        }

        return state;
      }

      default: {
        return state;
      }
    }
  },
};

export function createSubMeshTask(
  this: void,
  {
    enabled,
    name,
    subMesh,
  }: Partial<Pick<NodeTaskType, NodeTaskTypeOptionalField>> &
    Partial<Pick<SubMeshTaskField, "subMesh">> = {}
) {
  const field: Pick<SubMeshTaskType, "subMesh"> &
    Partial<Pick<SubMeshTaskType, NodeTaskTypeOptionalField>> = {
    enabled,
    name,
    subMesh: subMesh ?? null,
  };

  return createTask(TABLE_NAME, field, prototype);
}

export function isSubMeshTask(this: void, x: unknown): x is SubMeshTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
