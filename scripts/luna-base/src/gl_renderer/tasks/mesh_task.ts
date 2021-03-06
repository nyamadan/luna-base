import { allocTableName, getMetatableName } from "../../tables";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_MESH_TASK");

export interface MeshTaskField extends NodeTaskField {
  onLoad?: (this: void, task: MeshTask) => void;
}
export interface MeshTaskPrototype extends NodeTaskPrototype<MeshTask> {}
export type MeshTask = MeshTaskField & MeshTaskPrototype;

const prototype: MeshTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createMeshTask(
  this: void,
  params: NodeTaskProps<MeshTaskField, never, "onLoad"> = {}
): MeshTask {
  const { onLoad } = params;
  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...{ onLoad } },
    prototype
  );
}

export function isMeshTask(this: void, x: unknown): x is MeshTask {
  return getMetatableName(x) === TABLE_NAME;
}

export default function MeshTask(
  this: void,
  ...params: Parameters<typeof createMeshTask>
) {
  return createMeshTask(...params);
}
