import LunaX from "../lunax";
import { isImageTask } from "../image_task";
import { createTexture, Texture } from "../texture";
import Node from "./node_component";
import NodeTask from "./task_component";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskPrototype,
  NodeTaskType,
  NodeTaskTypeOptionalField,
} from "../node_task";
import { logger } from "../../logger";
import { Command, CommandState, NodeType } from "../node";
import { allocTableName, getMetatableName } from "../../tables";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXTURE_IMAGE_TASK");

interface TextureImageTaskField extends NodeTaskField {
  textures: Record<NodeTaskId, Texture | undefined>;
  onLoad?: (this: void, task: TextureImageTask, node: NodeType) => void;
}
interface TextureImageTaskPrototype
  extends NodeTaskPrototype<TextureImageTask> {}
export type TextureImageTask = TextureImageTaskPrototype &
  TextureImageTaskField;

function createTextureImageTask(
  this: void,
  {
    enabled,
    name,
    onLoad,
  }: Partial<Pick<TextureImageTask, NodeTaskTypeOptionalField | "onLoad">> = {}
) {
  const field: Pick<TextureImageTaskField, "textures" | "onLoad"> &
    Partial<Pick<TextureImageTaskField, NodeTaskTypeOptionalField>> = {
    enabled,
    name,
    onLoad,
    textures: {},
  };

  const prototype = {
    run(this: TextureImageTask, command: Command, state: CommandState) {
      const { name, node } = command;
      switch (name) {
        case "setup": {
          let numImageTask = 0;
          let numCompleteImageTask = 0;
          let numTotalCompleteImageTask = 0;
          for (const task of node.tasks) {
            if (isImageTask(task)) {
              const images = { ...state.images };
              const image = images[task.id];
              if (
                image?.status === "complete" &&
                this.textures[task.id] == null
              ) {
                logger.debug(`createTexture: %s`, task.path);
                const texture = createTexture(image);
                this.textures[task.id] = texture;
                numCompleteImageTask++;
              }

              if (this.textures[task.id] != null) {
                numTotalCompleteImageTask++;
              }
              numImageTask++;
            }
          }

          if (
            numImageTask > 0 &&
            numCompleteImageTask > 0 &&
            numTotalCompleteImageTask === numImageTask
          ) {
            logger.debug(
              `createTexture:onLoad(total: ${numTotalCompleteImageTask})`
            );
            this.onLoad?.(this, node);
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
    <Node name="TextureImageNode">
      <NodeTask task={task} />
    </Node>
  );

  return { node, task };
}

export default function TextureImageNode(
  this: void,
  {
    onCreate,
    enabled,
    name,
    onLoad,
  }: Partial<{
    onCreate: (this: void, node: NodeType, task: TextureImageTask) => void;
  }> &
    Partial<Pick<NodeTaskType, NodeTaskTypeOptionalField>> &
    Pick<TextureImageTaskField, "onLoad"> = {}
) {
  const { node, task } = createTextureImageTask({ onLoad, enabled, name });
  onCreate?.(node, task);
  return node;
}

export function isTextureImageTask(
  this: void,
  x: unknown
): x is TextureImageTask {
  return getMetatableName(x) === TABLE_NAME;
}
