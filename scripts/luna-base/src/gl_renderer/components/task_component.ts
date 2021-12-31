import { TableName } from "../../tables";
import { createTask, NodeTaskField, NodeTaskPrototype } from "../node_task";

export default function NodeTask(
  this: void,
  {
    field,
    prototype,
    name,
    onCreate,
  }: Partial<{
    onCreate: (this: void, o: ReturnType<typeof createTask>) => void;
  }> & {
    name?: TableName;
    field?: Omit<NodeTaskField, "id" | "enabled">;
    prototype: NodeTaskPrototype;
  }
) {
  const node = createTask(name ?? null, field ?? null, prototype);
  onCreate?.(node);
  return node;
}
