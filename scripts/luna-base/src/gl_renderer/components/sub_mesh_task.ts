import {
  NodeTaskProps,
  pickOptionalField,
} from "../node_task";
import {
  createSubMeshTask,
  SubMeshTaskField,
  SubMeshTaskType,
} from "../sub_mesh_task";

export default function SubMeshTask(
  this: void,
  params: NodeTaskProps<
    {},
    Pick<SubMeshTaskField, "subMesh"> & {
      onCreate: (this: void, task: SubMeshTaskType) => void;
    }
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
