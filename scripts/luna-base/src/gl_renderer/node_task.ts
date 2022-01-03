import { createTable, TableName } from "../tables";
import { uuid } from "../uuid";
import { Command, CommandState } from "./node";

export type NodeTaskId = string & { __node_task: never };

export interface NodeTaskField {
  readonly id: NodeTaskId;
  readonly name: string;
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
  T1 extends Omit<NodeTaskField, "id" | "name" | "enabled"> &
    Partial<Pick<NodeTaskField, "name" | "enabled">>,
  T2 extends NodeTaskPrototype
>(this: void, tableName: T | null, fields: T1 | null, prototype: T2) {
  const initial: Pick<NodeTaskField, "id" | "name" | "enabled"> = {
    id: uuid.v4() as NodeTaskId,
    name: tableName ?? "TASK",
    enabled: true,
  };

  return createTable(
    tableName,
    { ...initial, ...fields } as T1 & typeof initial,
    prototype as T2
  );
}

export function isNodeTask(this: void, x: unknown): x is NodeTaskType {
  return (x as any)?.run != null;
}
