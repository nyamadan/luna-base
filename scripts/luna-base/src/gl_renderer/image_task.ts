import * as _gl from "gl";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import {
  CommandState,
  createNode,
  Node,
  NodeField,
  NodeId,
  NodeTaskField,
  NodeTaskId,
  NodeTaskPrototype,
} from "./node";
import { createImage, Image } from "./image";

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

export function appendImageNode(
  this: void,
  parent: Node,
  path: string,
  option: Partial<Omit<NodeField, "id">> = {}
) {
  return parent.addChild(
    createNode({
      ...option,
      tasks: [createImageTask(path), ...(option.tasks ?? [])],
    })
  );
}

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

export function createImageTask(this: void, path: string): ImageTask {
  const fields: ImageTaskField = {
    id: uuid.v4() as NodeTaskId,
    enabled: true,
    path,
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isImageTask(this: void, x: unknown): x is ImageTask {
  return getMetatableName(x) === TABLE_NAME;
}
