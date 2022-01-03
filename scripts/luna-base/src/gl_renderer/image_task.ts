import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import { CommandState, NodeId } from "./node";
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
  id: NodeTaskId;
  path: string;
}

interface ImageTaskPrototype extends NodeTaskPrototype<ImageTaskType> {}

export type ImageTaskType = ImageTaskPrototype & ImageTaskField;

const prototype: ImageTaskPrototype = {
  run: function (command, state) {
    const { name, node } = command;
    switch (name) {
      case "setup": {
        const images = { ...state.images };

        if (images[node.id] == null) {
          logger.debug(`ImageTask.load: ${this.path}`);
          images[node.id] = createImage(this.path);
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
  id: NodeId
): Image | null {
  const img = state.images[id];

  if (img == null) {
    return null;
  }

  if (img.status !== "complete") {
    return null;
  }

  return img;
}

export function createImageTask(this: void, path: string): ImageTaskType {
  return createTask(TABLE_NAME, { path }, prototype);
}

export function isImageTask(this: void, x: unknown): x is ImageTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
