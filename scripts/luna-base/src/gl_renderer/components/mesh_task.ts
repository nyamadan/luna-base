import { NodeTaskType, NodeTaskTypeOptionalField } from "../node_task";
import { createMeshTask, MeshTask, MeshTaskField } from "../mesh_task";

export default function MeshTask(
  this: void,
  {
    onCreate,
    enabled,
    name,
    onLoad,
  }: Partial<{
    onCreate: (this: void, task: MeshTask) => void;
  }> &
    Partial<Pick<NodeTaskType, NodeTaskTypeOptionalField>> &
    Pick<MeshTaskField, "onLoad"> = {}
) {
  const task = createMeshTask({ onLoad, enabled, name });
  onCreate?.(task);
  return task;
}
