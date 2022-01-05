import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import { Geometry } from "./geometry";
import {
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GEOMETRY_TASK");

interface GeometryTaskField extends NodeTaskField {
  geometry: Geometry | null;
  generator: ((this: void) => Geometry) | null;
}

interface GeometryTaskPrototype extends NodeTaskPrototype<GeometryTaskType> {}

export type GeometryTaskType = GeometryTaskPrototype & GeometryTaskField;

const prototype: GeometryTaskPrototype = {
  run: function (command, state) {
    const { name, node } = command;
    switch (name) {
      case "setup": {
        const geometries = { ...state.geometries };

        if (geometries[this.guid] == null) {
        }

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
  params: NodeTaskProps<{}, Pick<GeometryTaskField, "generator" | "geometry">>
): GeometryTaskType {
  const { generator, geometry } = params;
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...{
        geometry: geometry ?? null,
        generator: generator ?? null,
      },
    },
    prototype
  );
}

export function isGeometryTask(this: void, x: unknown): x is GeometryTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
