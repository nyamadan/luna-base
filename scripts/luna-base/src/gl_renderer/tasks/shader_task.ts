import { logger } from "../../logger";
import { allocTableName, getMetatableName } from "../../tables";
import { createShader, Shader, ShaderType } from "../shader";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  NodeTaskType,
  pickOptionalField,
} from "./node_task";
import { isTextTask } from "./text_task";

const TABLE_NAME = allocTableName("LUA_TYPE_SHADER_TASK");

export interface ShaderTaskField extends NodeTaskField {
  type: ShaderType | null;

  shader: Shader | null;
}
export interface ShaderTaskPrototype
  extends NodeTaskPrototype<ShaderTaskType> {}
export type ShaderTaskType = ShaderTaskField & ShaderTaskPrototype;

const prototype: ShaderTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        if (this.shader != null) {
          return state;
        }

        if (this.type == null) {
          return state;
        }

        const textTask = this.findTaskInChildren(isTextTask);
        if (textTask == null) {
          return state;
        }

        this.shader = createShader(this.type, textTask.text);

        logger.debug(
          `ShaderTask(${this.guid}).shader<${this.shader.type}> = ${this.shader.guid}`
        );

        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createShaderTask(
  this: void,
  params?: NodeTaskProps<ShaderTaskField, never, "shader" | "type">
): ShaderTaskType {
  const field: Omit<ShaderTaskField, keyof NodeTaskType> = {
    type: params?.type ?? null,
    shader: params?.shader ?? null,
  };
  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...field },
    prototype
  );
}

export function isShaderTask(this: void, x: unknown): x is ShaderTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function ShaderTask(
  this: void,
  ...params: Parameters<typeof createShaderTask>
) {
  return createShaderTask(...params);
}
