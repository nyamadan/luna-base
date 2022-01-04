import { NodeTaskType, NodeTaskTypeOptionalField } from "../node_task";
import {
  createTextureImageTask,
  TextureImageTask,
  TextureImageTaskField,
} from "../texture_image_task";

export default function TextureImageTask(
  this: void,
  {
    onCreate,
    enabled,
    name,
    onLoad,
  }: Partial<{
    onCreate: (this: void, task: TextureImageTask) => void;
  }> &
    Partial<Pick<NodeTaskType, NodeTaskTypeOptionalField>> &
    Pick<TextureImageTaskField, "onLoad"> = {}
) {
  const task = createTextureImageTask({ onLoad, enabled, name });
  onCreate?.(task);
  return task;
}
