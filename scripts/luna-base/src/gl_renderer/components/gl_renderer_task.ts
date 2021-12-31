import { createGLRendererTask } from "../gl_renderer_task";

export default function GLRendererTask(
  this: void,
  {
    enabled,
    onCreate,
  }: Partial<{
    enabled: boolean;
    onCreate: (this: void, fn: ReturnType<typeof createGLRendererTask>) => void;
  }> = {}
) {
  const o = createGLRendererTask();
  o.enabled = enabled !== false;
  onCreate?.(o);
  return o;
}
