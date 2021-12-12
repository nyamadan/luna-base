import * as _gl from "gl";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { NodeTaskField, NodeTaskId, NodeTaskPrototype } from "./node";
import { createImage, Image } from "./image";

const TABLE_NAME = allocTableName("LUA_TYPE_IMAGE_TASK");

interface ImageTaskField extends NodeTaskField {
  id: NodeTaskId;
  image: Image;
  path: string;
}

interface ImageTaskPrototype extends NodeTaskPrototype<ImageTask> {}

export type ImageTask = ImageTaskPrototype & ImageTaskField;

const prototype: ImageTaskPrototype = {
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      case "load": {
        if (this.image.status === "ready") {
          this.image.load(this.path);
        }
        return state;
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
    image: createImage(),
    path,
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isImageTask(this: void, x: unknown): x is ImageTask {
  return getMetatableName(x) === TABLE_NAME;
}
