import { logger } from "../logger";
import { allocTableName, getMetatableName } from "../tables";
import { createMaterial, Material } from "./material";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";
import { isShaderProgramTask } from "./shader_program_task";
import { isTextureTask } from "./texture_task";
import { isVec4Task } from "./vec4_task";

const TABLE_NAME = allocTableName("LUA_TYPE_MATERIAL_TASK");

export type MaterialTaskId = NodeTaskId & { __material_task: never };

export interface MaterialTaskField
  extends NodeTaskField<MaterialTaskId, MaterialTaskType> {
  material: Material | null;
}

export interface MaterialTaskPrototype
  extends NodeTaskPrototype<MaterialTaskType> {}

export type MaterialTaskType = MaterialTaskField & MaterialTaskPrototype;

const prototype: MaterialTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        if (this.material != null) {
          return state;
        }

        const program = this.findTaskInChildren(isShaderProgramTask)?.program;
        if (program == null) {
          logger.info(`MaterialTask(${this.guid}): program is missing.`);
          return state;
        }

        const uniforms: Parameters<typeof createMaterial>[1] = {};
        for (const child of this.children) {
          if (isTextureTask(child) && child.texture != null) {
            if (uniforms[child.name] != null) {
              logger.warn(
                `MaterialTask(${this.guid}): duplicated uniform name: ${child.name}`
              );
            }
            uniforms[child.name] = {
              type: "Texture",
              texture: child.texture,
            };
            continue;
          }

          if (isVec4Task(child)) {
            uniforms[child.name] = {
              type: "Vec4",
              value: child.value,
            };
            continue;
          }
        }

        this.material = createMaterial(program, uniforms);
        logger.debug(
          `MaterialTask(${this.guid}).material = ${this.material.guid}`
        );

        return state;
      }
      default: {
        return state;
      }
    }
  },
});

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

export default function MaterialTask(
  this: void,
  ...params: Parameters<typeof createMaterialTask>
) {
  return createMaterialTask(...params);
}
