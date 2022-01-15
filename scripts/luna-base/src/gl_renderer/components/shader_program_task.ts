import { createShaderProgramTask } from "../shader_program_task";

export default function ShaderProgramTask(
  this: void,
  ...params: Parameters<typeof createShaderProgramTask>
) {
  return createShaderProgramTask(...params);
}
