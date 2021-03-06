import { allocTableName, getMetatableName } from "../../tables";
import { GeometryType } from "../geometry";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY_TASK");

export type GeometryTaskId = NodeTaskId & { __geometry_task: never };

export interface GeometryTaskField
  extends NodeTaskField<GeometryTaskId, GeometryTaskType> {
  generator: ((this: void) => GeometryType) | null;
}

export interface GeometryTaskPrototype
  extends NodeTaskPrototype<GeometryTaskType> {}

export type GeometryTaskType = GeometryTaskField & GeometryTaskPrototype;

const prototype: GeometryTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        const geometries = { ...state.geometries };
        geometries[this.guid] ??= this.generator?.();
        return { ...state, geometries };
      }
      default: {
        return state;
      }
    }
  },
});

export function createGeometryTask(
  this: void,
  params: NodeTaskProps<GeometryTaskField, "generator", never>
): GeometryTaskType {
  const { generator } = params;
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...{
        generator: generator ?? null,
      },
    },
    prototype
  ) as GeometryTaskType;
}

export function isGeometryTask(this: void, x: unknown): x is GeometryTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function GeometryTask(
  this: void,
  ...params: Parameters<typeof createGeometryTask>
) {
  return createGeometryTask(...params);
}
