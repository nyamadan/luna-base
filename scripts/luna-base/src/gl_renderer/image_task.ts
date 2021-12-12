import * as _gl from "gl";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { NodeTaskField, NodeTaskId, NodeTaskPrototype } from "./node";
import { createImage } from "./image";

const TABLE_NAME = allocTableName("LUA_TYPE_IMAGE_TASK");

interface ImageTaskField extends NodeTaskField {
  id: NodeTaskId;
  path: string;
}

interface ImageTaskPrototype extends NodeTaskPrototype<ImageTask> {}

export type ImageTask = ImageTaskPrototype & ImageTaskField;

const prototype: ImageTaskPrototype = {
  run: function (command, state) {
    const { name, node } = command;
    switch (name) {
      case "load": {
        const images = { ...state.images };

        if (images[node.id] == null) {
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

export function createImageTask(this: void, path: string): ImageTask {
  const fields: ImageTaskField = {
    id: uuid.v4() as NodeTaskId,
    path,
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isImageTask(this: void, x: unknown): x is ImageTask {
  return getMetatableName(x) === TABLE_NAME;
}
