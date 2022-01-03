import LunaX from "../lunax";
import Node from "./node_component";
import NodeTask from "./task_component";
import {
  createTask,
  NodeTaskField,
  NodeTaskPrototype,
  NodeTaskType,
  NodeTaskTypeOptionalField,
} from "../node_task";
import { Command, CommandState, NodeType } from "../node";
import { allocTableName, getMetatableName } from "../../tables";
import { isTextureImageTask } from "./texture_image_node";
import { logger } from "../../logger";

const TABLE_NAME = allocTableName("LUA_TYPE_MESH_TASK");

interface MeshTaskField extends NodeTaskField {
  onLoad?: (this: void, task: MeshTask, node: NodeType) => void;
}
interface MeshTaskPrototype extends NodeTaskPrototype<MeshTask> {}
export type MeshTask = MeshTaskPrototype & MeshTaskField;

function createMeshTask(
  this: void,
  {
    enabled,
    name,
    onLoad,
  }: Partial<Pick<MeshTask, NodeTaskTypeOptionalField | "onLoad">> = {}
) {
  const field: Pick<MeshTaskField, "onLoad"> &
    Partial<Pick<MeshTaskField, NodeTaskTypeOptionalField>> = {
    enabled,
    name,
    onLoad,
  };

  const prototype = {
    run(this: MeshTask, command: Command, state: CommandState) {
      const { name, node } = command;
      switch (name) {
        case "setup": {
          for (const task of node.tasks) {
            if (isTextureImageTask(task)) {
              logger.debug("Mesh: %s", task.name);
            }
          }
          return state;
        }
        default: {
          return state;
        }
      }
    },
  };

  const task = createTask(TABLE_NAME, field, prototype);

  const node: NodeType = (
    <Node name="MeshNode">
      <NodeTask task={task} />
    </Node>
  );

  return { node, task };
}

export default function MeshNode(
  this: void,
  {
    onCreate,
    enabled,
    name,
    onLoad,
  }: Partial<{
    onCreate: (this: void, node: NodeType, task: MeshTask) => void;
  }> &
    Partial<Pick<NodeTaskType, NodeTaskTypeOptionalField>> &
    Pick<MeshTaskField, "onLoad"> = {}
) {
  const { node, task } = createMeshTask({ onLoad, enabled, name });
  onCreate?.(node, task);
  return node;
}

export function isMeshTask(this: void, x: unknown): x is MeshTask {
  return getMetatableName(x) === TABLE_NAME;
}
