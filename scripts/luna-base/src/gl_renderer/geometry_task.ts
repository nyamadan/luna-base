import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import { Geometry } from "./geometry";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY_TASK");

export interface GeometryTaskField extends NodeTaskField {
  readonly guid: NodeTaskId & { __geometry_task: never };
  generator: ((this: void) => Geometry) | null;
}

export interface GeometryTaskPrototype
  extends NodeTaskPrototype<GeometryTaskType> {}

export type GeometryTaskType = GeometryTaskPrototype & GeometryTaskField;

const prototype: GeometryTaskPrototype = {
  run: function (command, state) {
    const { name, node } = command;
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
};

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
