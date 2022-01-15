import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  NodeTaskType,
  pickOptionalField,
} from "./node_task";
import { allocTableName, getMetatableName } from "../tables";
import { isTextTask } from "./text_task";
import { createShader, Shader, ShaderType } from "./shader";

const TABLE_NAME = allocTableName("LUA_TYPE_SHADER_TASK");

export interface ShaderTaskField extends NodeTaskField {
  type: ShaderType;

  shader: Shader | null;
}
export interface ShaderTaskPrototype extends NodeTaskPrototype<ShaderTask> {}
export type ShaderTask = ShaderTaskPrototype & ShaderTaskField;

const prototype: ShaderTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        if (this.shader == null) {
          return state;
        }

        const textTask = this.findTaskInChildren(isTextTask);
        if (textTask == null) {
          return state;
        }

        this.shader = createShader(this.type, textTask.text);

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
  params: NodeTaskProps<ShaderTaskField, "type", never>
): ShaderTask {
  const field: Omit<ShaderTaskField, keyof NodeTaskType> = {
    type: params.type,
    shader: null,
  };
  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...field },
    prototype
  );
}

export function isShaderTask(this: void, x: unknown): x is ShaderTask {
  return getMetatableName(x) === TABLE_NAME;
}
