import {
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";
import { Command, CommandState, NodeType } from "./node";
import { allocTableName, getMetatableName } from "../tables";
import { isTextureImageTask } from "./texture_image_task";
import { logger } from "../logger";

const TABLE_NAME = allocTableName("LUA_TYPE_MESH_TASK");

export interface MeshTaskField extends NodeTaskField {
  onLoad?: (this: void, task: MeshTask, node: NodeType) => void;
}
export interface MeshTaskPrototype extends NodeTaskPrototype<MeshTask> {}
export type MeshTask = MeshTaskPrototype & MeshTaskField;

const prototype: MeshTaskPrototype = {
  run(this: MeshTask, command: Command, state: CommandState) {
    const { name, node } = command;
    switch (name) {
      case "setup": {
        const textureImageTasks = node.findTasksInChildren(isTextureImageTask);
        for (const textureImageTask of textureImageTasks) {
          logger.debug("Mesh: %s", textureImageTask.name);
        }
        return state;
      }
      default: {
        return state;
      }
    }
  },
};

export function createMeshTask(
  this: void,
  params: NodeTaskProps<{}, Pick<MeshTaskField, "onLoad">> = {}
): MeshTask {
  const { onLoad } = params;
  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...{ onLoad } },
    prototype
  );
}

export function isMeshTask(this: void, x: unknown): x is MeshTask {
  return getMetatableName(x) === TABLE_NAME;
}
