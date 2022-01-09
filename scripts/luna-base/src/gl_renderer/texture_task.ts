import { createTexture, Texture } from "./texture";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
  TaskRef,
} from "./node_task";
import { logger } from "../logger";
import { NodeType } from "./node";
import { allocTableName, getMetatableName } from "../tables";
import { ImageTaskType, isImageTask } from "./image_task";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXTURE_IMAGE_TASK");

export type TextureTaskGuid = NodeTaskId & { __texture_task: never };

export interface TextureTaskField
  extends NodeTaskField<TextureTaskGuid, TextureTaskType> {
  texture: Texture | null;
  imageTaskRef: TaskRef<ImageTaskType> | null;
  onLoad: ((this: void, task: TextureTaskType, node: NodeType) => void) | null;
}

export interface TextureTaskPrototype
  extends NodeTaskPrototype<TextureTaskType> {}

export type TextureTaskType = TextureTaskPrototype & TextureTaskField;

const prototype: TextureTaskPrototype = {
  run(this, command, state) {
    const { name, node } = command;
    switch (name) {
      case "setup": {
        if (this.texture != null) {
          return state;
        }

        const task =
          this.imageTaskRef?.task ?? node.findTaskInChildren(isImageTask);
        if (task == null) {
          return state;
        }

        const image = state.images[task.guid];
        if (image?.status !== "complete") {
          return state;
        }

        logger.debug(`createTexture: %s`, task.path);
        const texture = createTexture(task.guid);
        this.texture = texture;
        logger.debug(`createTexture:onLoad()`);
        this.onLoad?.(this, node);
        return state;
      }
      default: {
        return state;
      }
    }
  },
};

export function createTextureTask(
  this: void,
  params: NodeTaskProps<
    TextureTaskField,
    never,
    "onLoad" | "texture" | "imageTaskRef"
  > = {}
): TextureTaskType {
  const field: Omit<TextureTaskField, keyof NodeTaskField> = {
    imageTaskRef: params.imageTaskRef ?? null,
    texture: params.texture ?? null,
    onLoad: params.onLoad ?? null,
  };

  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...field,
    },
    prototype
  ) as TextureTaskType;
}

export function isTextureTask(this: void, x: unknown): x is TextureTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export function assertTextureTask(
  this: void,
  x: unknown
): asserts x is TextureTaskType {
  assert(isTextureTask(x));
}