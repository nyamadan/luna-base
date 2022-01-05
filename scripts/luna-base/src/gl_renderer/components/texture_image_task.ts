import {
  NodeTaskProps,
  pickOptionalField,
} from "../node_task";
import {
  createTextureImageTask,
  TextureImageTask,
  TextureImageTaskField,
} from "../texture_image_task";

export default function TextureImageTask(
  this: void,
  params: NodeTaskProps<
    {},
    Pick<TextureImageTaskField, "onLoad"> & {
      onCreate: (this: void, task: TextureImageTask) => void;
    }
  > = {}
) {
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
