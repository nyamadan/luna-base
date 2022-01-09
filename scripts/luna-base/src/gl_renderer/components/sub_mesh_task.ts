import { createSubMeshTask, SubMeshTaskType } from "../sub_mesh_task";

export default function SubMeshTask(
  this: void,
  ...params: Parameters<typeof createSubMeshTask>
): SubMeshTaskType {
  return createSubMeshTask(...params);
}
