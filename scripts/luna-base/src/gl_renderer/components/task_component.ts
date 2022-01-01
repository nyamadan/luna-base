import { NodeTaskType } from "../node_task";

export default function NodeTask(
  this: void,
  {
    task,
  }: {
    task: NodeTaskType;
  }
) {
  return task;
}
