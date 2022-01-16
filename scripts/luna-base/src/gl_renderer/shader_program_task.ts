import { logger } from "../logger";
import { allocTableName, getMetatableName } from "../tables";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  NodeTaskType,
  pickOptionalField,
} from "./node_task";
import { Shader } from "./shader";
import { createShaderProgram, ShaderProgram } from "./shader_program";
import { isShaderTask, ShaderTaskType } from "./shader_task";

const TABLE_NAME = allocTableName("LUA_TYPE_SHADER_PROGRAM_TASK");

export interface ShaderProgramTaskField extends NodeTaskField {
  program: ShaderProgram | null;
}
export interface ShaderProgramTaskPrototype
  extends NodeTaskPrototype<ShaderProgramTaskType> {}
export type ShaderProgramTaskType = ShaderProgramTaskField &
  ShaderProgramTaskPrototype;

const prototype: ShaderProgramTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      case "setup": {
        if (this.program != null) {
          return state;
        }

        const vs = this.findTaskInChildren(
          (x): x is ShaderTaskType =>
            isShaderTask(x) && x.type === "VERTEX_SHADER"
        );
        if (vs == null) {
          logger.info(
            `ShaderProgramTask(${this.guid}).vertexShader is missing`
          );
          return state;
        }

        const fs = this.findTaskInChildren(
          (x): x is ShaderTaskType =>
            isShaderTask(x) && x.type === "FRAGMENT_SHADER"
        );
        if (fs == null) {
          logger.info(
            `ShaderProgramTask(${this.guid}).fragmentShader is missing.`
          );
          return state;
        }

        this.program = createShaderProgram(
          vs.shader as Shader<"VERTEX_SHADER">,
          fs.shader as Shader<"FRAGMENT_SHADER">
        );

        logger.debug(
          `ShaderProgramTask(${this.guid}).program = ${this.program.guid}`
        );

        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createShaderProgramTask(
  this: void,
  params?: NodeTaskProps<ShaderProgramTaskField, never, "program">
): ShaderProgramTaskType {
  const field: Omit<ShaderProgramTaskField, keyof NodeTaskType> = {
    program: params?.program ?? null,
  };
  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...field },
    prototype
  );
}

export function isShaderProgramTask(
  this: void,
  x: unknown
): x is ShaderProgramTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function ShaderProgramTask(
  this: void,
  ...params: Parameters<typeof createShaderProgramTask>
) {
  return createShaderProgramTask(...params);
}
