import { NodeTaskProps, pickOptionalField } from "../node_task";
import { createMeshTask, MeshTask, MeshTaskField } from "../mesh_task";

export default function MeshTask(
  this: void,
  params: NodeTaskProps<
    MeshTaskField & {
      onCreate: (this: void, task: MeshTask) => void;
    },
    never,
    "onLoad" | "onCreate"
  > = {}
) {
  const { onLoad, onCreate } = params;
  const task = createMeshTask({
    ...pickOptionalField(params),
    ...{
      onLoad,
    },
  });
  onCreate?.(task);
  return task;
}
