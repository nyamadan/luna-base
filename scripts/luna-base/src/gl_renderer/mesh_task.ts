import LunaX from "./lunax";
import Node from "./components/node_component";
import NodeTask from "./components/task_component";
import {
  createTask,
  NodeTaskField,
  NodeTaskPrototype,
  NodeTaskType,
  NodeTaskTypeOptionalField,
} from "./node_task";
import { Command, CommandState, NodeType } from "./node";
import { allocTableName, getMetatableName } from "../tables";
import { isTextureImageTask, TextureImageTask } from "./texture_image_task";
import { logger } from "../logger";
import { TransformTask } from "./transform_task";

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
        const textureImageTasks = node.findTasks(isTextureImageTask, 1);
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
  {
    enabled,
    name,
    onLoad,
  }: Partial<Pick<MeshTask, NodeTaskTypeOptionalField | "onLoad">> = {}
): MeshTask {
  const field: Pick<MeshTaskField, "onLoad"> &
    Partial<Pick<MeshTaskField, NodeTaskTypeOptionalField>> = {
    enabled,
    name,
    onLoad,
  };

  return createTask(TABLE_NAME, field, prototype);
}

export function isMeshTask(this: void, x: unknown): x is MeshTask {
  return getMetatableName(x) === TABLE_NAME;
}
