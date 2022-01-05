import { NodeTaskProps, pickOptionalField } from "../node_task";
import {
  createTextureImageTask,
  TextureImageTask,
  TextureImageTaskField,
} from "../texture_image_task";

export default function TextureImageTask(
  this: void,
  params: NodeTaskProps<
    TextureImageTaskField & {
      onCreate: (this: void, task: TextureImageTask) => void;
    },
    never,
    "onCreate" | "onLoad"
  > = {}
): TextureImageTask {
  const { onCreate, onLoad } = params;
  const task = createTextureImageTask({
    ...pickOptionalField(params),
    ...{
      onLoad,
    },
  });
  onCreate?.(task);
  return task;
}
