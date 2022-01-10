import * as _gl from "gl";
import { logger } from "../logger";
import { allocTableName, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { isGeometryTask } from "./geometry_task";
import { isMaterialTask } from "./material_task";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";
import { createSubMesh, SubMesh } from "./sub_mesh";

const TABLE_NAME = allocTableName("LUA_TYPE_SUB_MESH_TASK");

export type SubMeshTaskId = NodeTaskId & { __sub_mesh_task: never };
export interface SubMeshTaskField
  extends NodeTaskField<SubMeshTaskId, SubMeshTaskType> {
  subMesh: SubMesh | null;
}

export interface SubMeshTaskPrototype
  extends NodeTaskPrototype<SubMeshTaskType> {}

export type SubMeshTaskType = SubMeshTaskPrototype & SubMeshTaskField;

const prototype: SubMeshTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        if (this.subMesh != null) {
          return state;
        }

        const geometry = this.findTaskInChildren(isGeometryTask);
        assertIsNotNull(geometry);
        logger.debug(
          `SubMeshTask.geometry = ${geometry.name}(${geometry.guid})`
        );

        const material = this.findTaskInChildren(isMaterialTask)?.material;
        assertIsNotNull(material);
        logger.debug(`SubMeshTask.material = ${material.guid}`);

        this.subMesh = createSubMesh({
          geometryTaskGuid: geometry.guid,
          material: material,
        });

        return state;
      }

      default: {
        return state;
      }
    }
  },
});

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
