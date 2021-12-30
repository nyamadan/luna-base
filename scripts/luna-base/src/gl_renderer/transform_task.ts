import * as _gl from "gl";
import { createF32Mat4 } from "../buffers/f32array";
import { mat4 } from "../math/mat4";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { NodeTaskField, NodeTaskId, NodeTaskPrototype } from "./node_task";
import { Transform } from "./transform";

const TABLE_NAME = allocTableName("LUA_TYPE_TRANSFORM_TASK");

interface TransformTaskField extends NodeTaskField {
  id: NodeTaskId;
  transform: Transform;
}

interface TransformTaskPrototype extends NodeTaskPrototype<TransformTask> {}

export type TransformTask = TransformTaskPrototype & TransformTaskField;

const prototype: TransformTaskPrototype = {
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      case "transform": {
        this.transform.update();
        const worlds = { ...state.worlds };
        const world = (worlds[command.node.id] ??= createF32Mat4());
        mat4.mul(world, command.world, this.transform.local);
        return { ...state, worlds };
      }
      default: {
        return state;
      }
    }
  },
};

export function createTransformTask(this: void, transform: Transform) {
  const fields: TransformTaskField = {
    id: uuid.v4() as NodeTaskId,
    enabled: true,
    transform,
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isTransformTask(this: void, x: unknown): x is TransformTask {
  return getMetatableName(x) === "LUA_TYPE_TRANSFORM_TASK";
}
