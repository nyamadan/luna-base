import { createTable, TableName } from "../tables";
import { uuid } from "../uuid";
import { Command, CommandState } from "./node";

export type NodeTaskId = string & { __node_task: never };

export interface NodeTaskField {
  readonly id: NodeTaskId;
  enabled: boolean;
}

export interface NodeTaskPrototype<
  T extends NodeTaskType = NodeTaskType,
  U = any
> {
  run(this: T, command: Command, state: CommandState<U>): CommandState<U>;
}

export type NodeTaskType = NodeTaskField & NodeTaskPrototype;

export function createTask<
  T extends TableName,
  T1 extends Omit<NodeTaskField, "id" | "enabled">,
  T2 extends NodeTaskPrototype
>(this: void, tableName: T | null, fields: T1 | null, prototype: T2) {
  const initial: Pick<NodeTaskField, "id" | "enabled"> = {
    id: uuid.v4() as NodeTaskId,
    enabled: true,
  };

  return createTable(
    tableName,
    { ...initial, ...fields } as T1 & Pick<NodeTaskField, "id" | "enabled">,
    prototype as T2
  );
}

export function isNodeTask(this: void, x: unknown): x is NodeTaskType {
  return (x as any)?.run != null;
}

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
