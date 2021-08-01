import * as _gl from "gl";
import { getMetatableName } from "../type_utils";
import { unreachable } from "../unreachable";
import { uuid } from "../uuid";
import { NodeTask } from "./node";
import { SubMesh } from "./sub_mesh";

interface SubMeshTaskFields {
  id: string;
  subMesh: SubMesh;
}

interface SubMeshTaskPrototype extends NodeTask {}

export type SubMeshTask = SubMeshTaskPrototype & SubMeshTaskFields;

const prototype: SubMeshTaskPrototype = {
  run: function (command) {
    const { name } = command;
    switch (name) {
      case "update": {
        return;
      }
      case "render": {
        return;
      }
      default: {
        return unreachable();
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
  const fields: SubMeshTaskFields = { id: uuid.v4(), subMesh };
  const o = setmetatable(fields, metatable) as SubMeshTask;

  return o;
}

export function isSubMeshTask(this: void, x: unknown): x is SubMeshTask {
  return getMetatableName(x) === "LUA_TYPE_SUB_MESH_TASK";
}
