import { createShaderTask } from "../shader_task";

export default function ShaderTask(
  this: void,
  ...params: Parameters<typeof createShaderTask>
) {
  return createShaderTask(...params);
}
