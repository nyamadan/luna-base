import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import { CommandState } from "./node";
import { createImage, Image } from "./image";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskPrototype,
} from "./node_task";
import { logger } from "../logger";

const TABLE_NAME = allocTableName("LUA_TYPE_IMAGE_TASK");

interface ImageTaskField extends NodeTaskField {
  readonly guid: NodeTaskId & { __image_task: never };
  path: string;
}

interface ImageTaskPrototype extends NodeTaskPrototype<ImageTaskType> {}

export type ImageTaskType = ImageTaskPrototype & ImageTaskField;

const prototype: ImageTaskPrototype = {
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
};

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
  params: Partial<Omit<ImageTaskField, "guid" | "name" | "path">> &
    Pick<ImageTaskField, "path"> &
    Partial<Pick<ImageTaskField, "name">>
): ImageTaskType {
  return createTask(TABLE_NAME, params, prototype) as ImageTaskType;
}

export function isImageTask(this: void, x: unknown): x is ImageTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
