import { createVec4Task, Vec4TaskType } from "../vec4_task";

export default function Vec4Task(
  this: void,
  ...params: Parameters<typeof createVec4Task>
): Vec4TaskType {
  return createVec4Task(...params);
}
