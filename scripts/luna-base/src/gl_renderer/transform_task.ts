import * as _gl from "gl";
import { createF32Mat4 } from "../buffers/f32array";
import { mat4 } from "../math/mat4";
import { getMetatableName } from "../type_utils";
import { uuid } from "../uuid";
import { NodeTaskField, NodeTaskId, NodeTaskPrototype } from "./node";
import { Transform } from "./transform";

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
      case "update": {
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

const metatable = {
  __index: prototype,
  __name: "LUA_TYPE_TRANSFORM_TASK",
  __gc: function (this: TransformTask) {},
};

export function createTransformTask(this: void, transform: Transform) {
  const fields: TransformTaskField = {
    id: uuid.v4() as NodeTaskId,
    transform,
  };
  const o = setmetatable(fields, metatable) as TransformTask;
  return o;
}

export function isTransformTask(this: void, x: unknown): x is TransformTask {
  return getMetatableName(x) === "LUA_TYPE_TRANSFORM_TASK";
}
