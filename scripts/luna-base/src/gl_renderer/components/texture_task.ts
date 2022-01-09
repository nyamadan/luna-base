import { createTextureTask, TextureTaskType } from "../texture_task";

export default function TextureTask(
  this: void,
  ...params: Parameters<typeof createTextureTask>
): TextureTaskType {
  return createTextureTask(...params);
}
