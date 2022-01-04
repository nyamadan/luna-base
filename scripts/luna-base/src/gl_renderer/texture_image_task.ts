import { isImageTask } from "./image_task";
import { createTexture, Texture } from "./texture";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskPrototype,
  NodeTaskTypeOptionalField,
} from "./node_task";
import { logger } from "../logger";
import { NodeType } from "./node";
import { allocTableName, getMetatableName } from "../tables";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXTURE_IMAGE_TASK");

export interface TextureImageTaskField extends NodeTaskField {
  textures: Record<NodeTaskId, Texture | undefined>;
  onLoad?: (this: void, task: TextureImageTask, node: NodeType) => void;
}

export interface TextureImageTaskPrototype
  extends NodeTaskPrototype<TextureImageTask> {}

export type TextureImageTask = TextureImageTaskPrototype &
  TextureImageTaskField;

const prototype: TextureImageTaskPrototype = {
  run(this, command, state) {
    const { name, node } = command;
    switch (name) {
      case "setup": {
        let numImageTask = 0;
        let numCompleteImageTask = 0;
        let numTotalCompleteImageTask = 0;
        for (const task of node.findTasks(isImageTask)) {
          const images = { ...state.images };
          const image = images[task.id];
          if (image?.status === "complete" && this.textures[task.id] == null) {
            logger.debug(`createTexture: %s`, task.path);
            const texture = createTexture(task.id);
            this.textures[task.id] = texture;
            numCompleteImageTask++;
          }

          if (this.textures[task.id] != null) {
            numTotalCompleteImageTask++;
          }
          numImageTask++;
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

export function createTextureImageTask(
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

  return createTask(TABLE_NAME, field, prototype);
}

export function isTextureImageTask(
  this: void,
  x: unknown
): x is TextureImageTask {
  return getMetatableName(x) === TABLE_NAME;
}
