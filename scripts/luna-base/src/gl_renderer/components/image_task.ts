import { createImageTask, ImageTaskType } from "../image_task";

export default function ImageTask(
  this: void,
  {
    path,
    enabled,
    onCreate,
  }: Partial<{
    enabled: boolean;
    onCreate: (this: void, fn: ReturnType<typeof createImageTask>) => void;
  }> &
    Pick<ImageTaskType, "path">
) {
  const o = createImageTask(path);
  o.enabled = enabled !== false;
  onCreate?.(o);
  return o;
}
