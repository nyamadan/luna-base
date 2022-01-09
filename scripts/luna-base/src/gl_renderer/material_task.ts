import * as _gl from "gl";
import { allocTableName, getMetatableName } from "../tables";
import { createBasicMaterial } from "./basic_shader_program";
import { Material } from "./material";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";
import { isTextureTask } from "./texture_task";

const TABLE_NAME = allocTableName("LUA_TYPE_MATERIAL_TASK");

export type MaterialTaskId = NodeTaskId & { __material_task: never };

export interface MaterialTaskField
  extends NodeTaskField<MaterialTaskId, MaterialTaskType> {
  material: Material | null;
}

export interface MaterialTaskPrototype
  extends NodeTaskPrototype<MaterialTaskType> {}

export type MaterialTaskType = MaterialTaskPrototype & MaterialTaskField;

const prototype: MaterialTaskPrototype = {
  run: function (command, state) {
    const { name, node } = command;
    switch (name) {
      case "setup": {
        if (this.material != null) {
          return state;
        }

        var texture = node.findTaskInChildren(isTextureTask)?.texture;
        if (texture == null) {
          return state;
        }

        this.material = createBasicMaterial(texture);

        return state;
      }
      default: {
        return state;
      }
    }
  },
};

export function createMaterialTask(
  this: void,
  params: NodeTaskProps<MaterialTaskField, never, never> = {}
): MaterialTaskType {
  const field: Omit<MaterialTaskField, keyof NodeTaskField> = {
    material: null,
  };
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...field,
    },
    prototype
  ) as MaterialTaskType;
}

export function isMaterialTask(this: void, x: unknown): x is MaterialTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
