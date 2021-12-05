import * as _gl from "gl";
import { getMetatableName } from "../type_utils";
import { uuid } from "../uuid";
import { NodeTaskField, NodeTaskId, NodeTaskPrototype } from "./node";
import { SubMesh } from "./sub_mesh";

interface SubMeshTaskField extends NodeTaskField {
  id: NodeTaskId;
  subMesh: SubMesh;
}

interface SubMeshTaskPrototype extends NodeTaskPrototype<SubMeshTask> {}

export type SubMeshTask = SubMeshTaskPrototype & SubMeshTaskField;

const prototype: SubMeshTaskPrototype = {
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      default: {
        return state;
      }
    }
  },
};

const metatable = {
  __index: prototype,
  __name: "LUA_TYPE_SUB_MESH_TASK",
  __gc: function (this: SubMeshTask) {},
};

export function createSubMeshTask(this: void, subMesh: SubMesh) {
  const fields: SubMeshTaskField = { id: uuid.v4() as NodeTaskId, subMesh };
  const o = setmetatable(fields, metatable) as SubMeshTask;

  return o;
}

export function isSubMeshTask(this: void, x: unknown): x is SubMeshTask {
  return getMetatableName(x) === "LUA_TYPE_SUB_MESH_TASK";
}
