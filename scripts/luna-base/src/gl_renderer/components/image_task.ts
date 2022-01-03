import { createImageTask, ImageTaskType } from "../image_task";

export default function ImageTask(
  this: void,
  {
    path,
    enabled,
    name,
    onCreate,
  }: Partial<{
    onCreate: (this: void, fn: ReturnType<typeof createImageTask>) => void;
  }> &
    Pick<ImageTaskType, "path"> &
    Partial<Pick<ImageTaskType, "enabled" | "name">>
) {
  const o = createImageTask({ path, enabled, name });
  onCreate?.(o);
  return o;
}
