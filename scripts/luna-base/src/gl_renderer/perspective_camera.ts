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
      case "update": {
        mat4.perspective(this.transform.local, 60.0, 1, 0.1, 100.0);
        mat4.decompose(
          this.transform.rotation,
          this.transform.position,
          this.transform.scale,
          this.transform.local
        );
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
  params: NodeTaskProps<PerspectiveCameraTaskField, never, never>
): PerspectiveCameraTaskType {
  const field: Omit<PerspectiveCameraTaskField, keyof NodeTaskType> = {};
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
