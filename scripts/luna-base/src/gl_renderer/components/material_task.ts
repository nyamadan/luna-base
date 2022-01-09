import { createMaterialTask } from "../material_task";

export default function MaterialTask(
  this: void,
  ...params: Parameters<typeof createMaterialTask>
) {
  return createMaterialTask(...params);
}
