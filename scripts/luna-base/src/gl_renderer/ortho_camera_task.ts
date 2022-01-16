import mat4 from "../math/mat4";
import { allocTableName, getMetatableName } from "../tables";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  NodeTaskType,
  pickOptionalField,
} from "./node_task";
import { createTransform, Transform } from "./transform";

const TABLE_NAME = allocTableName("LUA_TYPE_PERSPECTIVE_CAMERA_TASK");

export interface OrthoCameraTaskField extends NodeTaskField {}
export interface OrthoCameraTaskPrototype
  extends NodeTaskPrototype<OrthoCameraTaskType> {}
export type OrthoCameraTaskType = OrthoCameraTaskField &
  OrthoCameraTaskPrototype;

const prototype: OrthoCameraTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      case "update": {
        mat4.ortho(this.transform.local, -0.5, 0.5, -0.5, 0.5, 0.1, 100.0);
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createOrthoCameraTask(
  this: void,
  params: Omit<NodeTaskProps<OrthoCameraTaskField, never, never>, "transform">
): OrthoCameraTaskType {
  interface ExTransform extends Transform {
    update(): void;
    _update(): void;
  }
  const transform = createTransform() as ExTransform;
  transform._update = transform.update;
  transform.update = function (this: ExTransform) {};

  const field: Omit<OrthoCameraTaskField, keyof NodeTaskType> &
    Pick<NodeTaskType, "transform"> = {
    transform: transform,
  };
  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...field },
    prototype
  );
}

export function isOrthoCameraTask(
  this: void,
  x: unknown
): x is OrthoCameraTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function OrthoCameraTask(
  this: void,
  ...params: Parameters<typeof createOrthoCameraTask>
) {
  return createOrthoCameraTask(...params);
}
