import { createMeshTask, MeshTask } from "../mesh_task";

export default function MeshTask(
  this: void,
  ...params: Parameters<typeof createMeshTask>
) {
  return createMeshTask(...params);
}
