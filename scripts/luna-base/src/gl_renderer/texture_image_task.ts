import { isImageTask } from "./image_task";
import { createTexture, Texture } from "./texture";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
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
        for (const task of node.findTasksInChildren(isImageTask)) {
          const images = { ...state.images };
          const image = images[task.guid];
          if (
            image?.status === "complete" &&
            this.textures[task.guid] == null
          ) {
            logger.debug(`createTexture: %s`, task.path);
            const texture = createTexture(task.guid);
            this.textures[task.guid] = texture;
            numCompleteImageTask++;
          }

          if (this.textures[task.guid] != null) {
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
  params: NodeTaskProps<TextureImageTaskField, never, "onLoad"> = {}
): TextureImageTask {
  const { onLoad } = params;
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...{
        onLoad,
        textures: {},
      },
    },
    prototype
  );
}

export function isTextureImageTask(
  this: void,
  x: unknown
): x is TextureImageTask {
  return getMetatableName(x) === TABLE_NAME;
}

export function assertTextureImageTask(
  this: void,
  x: unknown
): asserts x is TextureImageTask {
  assert(isTextureImageTask(x));
}
