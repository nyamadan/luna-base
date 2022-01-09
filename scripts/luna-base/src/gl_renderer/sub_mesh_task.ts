import * as _gl from "gl";
import { dbg, logger } from "../logger";
import { allocTableName, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { isGeometryTask } from "./geometry_task";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";
import { SubMesh } from "./sub_mesh";

const TABLE_NAME = allocTableName("LUA_TYPE_SUB_MESH_TASK");

export type SubMeshTaskId = NodeTaskId & { __sub_mesh_task: never };
export interface SubMeshTaskField
  extends NodeTaskField<SubMeshTaskId, SubMeshTaskType> {
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

        logger.debug(`SubMeshTask:geometry ${geometry.name}(${geometry.guid})`);

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
  const field: Omit<SubMeshTaskField, keyof NodeTaskField> = {
    subMesh: params.subMesh ?? null,
  };
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...field,
    },
    prototype
  ) as SubMeshTaskType;
}

export function isSubMeshTask(this: void, x: unknown): x is SubMeshTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
