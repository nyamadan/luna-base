import { logger } from "../logger";
import { allocTableName, getMetatableName } from "../tables";
import { ImageTaskType, isImageTask } from "./image_task";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
  TaskRef,
} from "./node_task";
import { createTexture, Texture } from "./texture";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXTURE_IMAGE_TASK");

export type TextureTaskGuid = NodeTaskId & { __texture_task: never };

export interface TextureTaskField
  extends NodeTaskField<TextureTaskGuid, TextureTaskType> {
  texture: Texture | null;
  imageTaskRef: TaskRef<ImageTaskType> | null;
  onLoad: ((this: void, task: TextureTaskType) => void) | null;
}

export interface TextureTaskPrototype
  extends NodeTaskPrototype<TextureTaskType> {}

export type TextureTaskType = TextureTaskField & TextureTaskPrototype;

const prototype: TextureTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        if (this.texture != null) {
          return state;
        }

        const task =
          this.imageTaskRef?.task ?? this.findTaskInChildren(isImageTask);
        if (task == null) {
          return state;
        }

        const image = state.images[task.guid];
        if (image?.status !== "complete") {
          return state;
        }

        const texture = createTexture(task.guid);
        this.texture = texture;
        logger.debug(
          `TextureTaskTask(${this.guid}).texture = ${texture.guid} `
        );
        this.onLoad?.(this);
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createTextureTask(
  this: void,
  params: NodeTaskProps<
    TextureTaskField,
    never,
    "imageTaskRef" | "onLoad" | "texture"
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

export default function TextureTask(
  this: void,
  ...params: Parameters<typeof createTextureTask>
): TextureTaskType {
  return createTextureTask(...params);
}
