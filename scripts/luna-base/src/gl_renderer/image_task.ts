import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import { createImage, Image } from "./image";
import {
  CommandState,
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";
import { logger } from "../logger";

const TABLE_NAME = allocTableName("LUA_TYPE_IMAGE_TASK");

export type ImageTaskId = NodeTaskId & { __image_task: never };

export interface ImageTaskField
  extends NodeTaskField<ImageTaskId, ImageTaskType> {
  path: string;
}

export interface ImageTaskPrototype extends NodeTaskPrototype<ImageTaskType> {}

export type ImageTaskType = ImageTaskPrototype & ImageTaskField;

const prototype: ImageTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        const images = { ...state.images };

        if (images[this.guid] == null) {
          logger.debug(`ImageTask.load: ${this.path}`);
          images[this.guid] = createImage(this.path);
        }

        return { ...state, images };
      }
      default: {
        return state;
      }
    }
  },
});

export function loadImageFromState(
  this: void,
  state: CommandState,
  guid: NodeTaskId
): Image | null {
  const img = state.images[guid];

  if (img == null) {
    return null;
  }

  if (img.status !== "complete") {
    return null;
  }

  return img;
}

export function createImageTask(
  this: void,
  params: NodeTaskProps<ImageTaskField, "path", never>
): ImageTaskType {
  const field: Omit<ImageTaskField, keyof NodeTaskField> = {
    path: params.path,
  };
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...field,
    },
    prototype
  ) as ImageTaskType;
}

export function isImageTask(this: void, x: unknown): x is ImageTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
