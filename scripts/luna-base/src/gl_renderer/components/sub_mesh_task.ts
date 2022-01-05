import { NodeTaskProps, pickOptionalField } from "../node_task";
import {
  createSubMeshTask,
  SubMeshTaskField,
  SubMeshTaskType,
} from "../sub_mesh_task";

export default function SubMeshTask(
  this: void,
  params: NodeTaskProps<
    SubMeshTaskField & {
      onCreate: (this: void, task: SubMeshTaskType) => void;
    },
    never,
    "onCreate" | "subMesh"
  > = {}
): SubMeshTaskType {
  const { onCreate, subMesh } = params;
  const task = createSubMeshTask({
    ...pickOptionalField(params),
    ...{
      subMesh,
    },
  });
  onCreate?.(task);
  return task;
}
