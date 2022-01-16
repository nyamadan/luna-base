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

export interface PerspectiveCameraTaskField extends NodeTaskField {}
export interface PerspectiveCameraTaskPrototype
  extends NodeTaskPrototype<PerspectiveCameraTaskType> {}
export type PerspectiveCameraTaskType = PerspectiveCameraTaskField &
  PerspectiveCameraTaskPrototype;

const prototype: PerspectiveCameraTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      case "update-world": {
        mat4.perspective(this.transform.local, 60.0, 1, 0.1, 100.0);
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createPerspectiveCameraTask(
  this: void,
  params: Omit<
    NodeTaskProps<PerspectiveCameraTaskField, never, never>,
    "transform"
  >
): PerspectiveCameraTaskType {
  interface ExTransform extends Transform {
    update(): void;
    _update(): void;
  }

  const transform = createTransform() as ExTransform;
  transform._update = transform.update;
  transform.update = function (this: ExTransform) {};

  const field: Omit<PerspectiveCameraTaskField, keyof NodeTaskType> &
    Pick<NodeTaskType, "transform"> = {
    transform,
  };

  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...field },
    prototype
  );
}

export function isPerspectiveCameraTask(
  this: void,
  x: unknown
): x is PerspectiveCameraTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function PerspectiveCameraTask(
  this: void,
  ...params: Parameters<typeof createPerspectiveCameraTask>
) {
  return createPerspectiveCameraTask(...params);
}
