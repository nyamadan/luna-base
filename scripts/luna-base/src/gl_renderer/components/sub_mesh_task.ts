import { NodeTaskType, NodeTaskTypeOptionalField } from "../node_task";
import {
  createSubMeshTask,
  SubMeshTaskField,
  SubMeshTaskType,
} from "../sub_mesh_task";

export default function SubMeshTask(
  this: void,
  {
    onCreate,
    subMesh,
    enabled,
    name,
  }: Partial<{
    onCreate: (this: void, task: SubMeshTaskType) => void;
  }> &
    Partial<Pick<NodeTaskType, NodeTaskTypeOptionalField>> &
    Partial<Pick<SubMeshTaskField, "subMesh">> = {}
) {
  const task = createSubMeshTask({ subMesh, enabled, name });
  onCreate?.(task);
  return task;
}
