import { createTable, TableName } from "../tables";
import { uuid } from "../uuid";
import { Command, CommandState, NodeType } from "./node";

export type NodeTaskId = string & { __node_task: never };

export interface TaskRef<T extends NodeTaskType = NodeTaskType> {
  node: NodeType | null;
  task: T | null;
}

export function createTaskRef<T extends NodeTaskType = NodeTaskType>(
  node?: NodeType | null,
  task?: T | null
): TaskRef<T> {
  return {
    node: node ?? null,
    task: task ?? null,
  };
}

export interface NodeTaskField<
  Id extends NodeTaskId = NodeTaskId,
  T extends NodeTaskType = NodeTaskType
> {
  readonly guid: Id;
  readonly isTask: true;
  name: string;
  enabled: boolean;
  tags: string[];
  ref: TaskRef<T> | null;
}

export interface NodeTaskPrototype<
  T extends NodeTaskType = NodeTaskType,
  U = any
> {
  run(this: T, command: Command, state: CommandState<U>): CommandState<U>;
}

export type NodeTaskType = NodeTaskField & NodeTaskPrototype;

type NodeTaskTypeOptionalField = "name" | "enabled" | "tags" | "ref";
type NodeTaskTypeAutoField = "guid" | "isTask";

export type NodeTaskProps<
  T extends NodeTaskField,
  M extends keyof Omit<T, keyof NodeTaskField>,
  O extends keyof Omit<T, keyof NodeTaskField>
> = Partial<Pick<T, NodeTaskTypeOptionalField>> &
  Pick<Omit<T, keyof NodeTaskField>, M> &
  Partial<Pick<Omit<T, keyof NodeTaskField>, O>>;

export function pickOptionalField(
  this: void,
  params: Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>>
) {
  const { enabled, name, tags, ref } = params;
  return {
    name,
    enabled,
    tags,
    ref,
  };
}

export function createTask<
  T extends TableName,
  T1 extends Omit<
    NodeTaskField,
    NodeTaskTypeAutoField | NodeTaskTypeOptionalField
  > &
    Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>>,
  T2 extends NodeTaskPrototype
>(this: void, tableName: T | null, fields: T1 | null, prototype: T2) {
  const initial: Pick<
    NodeTaskField,
    NodeTaskTypeAutoField | NodeTaskTypeOptionalField
  > = {
    guid: uuid.v4() as NodeTaskId,
    name: tableName ?? "TASK",
    enabled: true,
    isTask: true,
    tags: [],
    ref: null,
  };

  return createTable(
    tableName,
    { ...initial, ...fields } as T1 & typeof initial,
    prototype as T2
  ) as (T1 & typeof initial) & T2;
}

export function isNodeTask(this: void, x: unknown): x is NodeTaskType {
  return (x as any)?.isTask === true;
}
