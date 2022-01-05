import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { isGeometryTask } from "./geometry_task";
import {
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
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

        const geometry = node.findTaskInChildren(isGeometryTask);
        assertIsNotNull(geometry);

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
  params: NodeTaskProps<SubMeshTaskField, never, "subMesh"> = {}
): SubMeshTaskType {
  const { subMesh } = params;
  const task = createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...{
        subMesh: subMesh ?? null,
      },
    },
    prototype
  );
  return task;
}

export function isSubMeshTask(this: void, x: unknown): x is SubMeshTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
