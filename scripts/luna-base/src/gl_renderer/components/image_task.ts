import { createImageTask } from "../image_task";

export default function ImageTask(
  this: void,
  ...params: Parameters<typeof createImageTask>
) {
  return createImageTask(...params);
}
