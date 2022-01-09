import { createGLRendererTask } from "../gl_renderer_task";

export default function GLRendererTask(
  this: void,
  ...params: Parameters<typeof createGLRendererTask>
) {
  return createGLRendererTask(...params);
}
