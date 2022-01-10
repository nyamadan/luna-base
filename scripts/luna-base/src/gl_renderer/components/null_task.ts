import { createNullTask } from "../node_task";

export default function NullTask(
  this: void,
  ...params: Parameters<typeof createNullTask>
) {
  return createNullTask(...params);
}
