import { createTable, TableName } from "../tables";
import { uuid } from "../uuid";
import { Command, CommandState, NodeRef, NodeType } from "./node";

export type NodeTaskId = string & { __node_task: never };

export interface TaskRef {
  node: NodeType | null;
  task: NodeTaskType | null;
}

export interface NodeTaskField {
  readonly guid: NodeTaskId;
  readonly name: string;
  enabled: boolean;
  tags: string[];
  ref: TaskRef | null;
}

export interface NodeTaskPrototype<
  T extends NodeTaskType = NodeTaskType,
  U = any
> {
  run(this: T, command: Command, state: CommandState<U>): CommandState<U>;
}

export type NodeTaskType = NodeTaskField & NodeTaskPrototype;

type NodeTaskTypeOptionalField = "name" | "enabled" | "tags" | "ref";

export type NodeTaskProps<Mandatory = {}, Optional = {}> = Partial<
  Pick<NodeTaskField, NodeTaskTypeOptionalField>
> &
  Mandatory &
  Partial<Optional>;

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
  T1 extends Omit<NodeTaskField, "guid" | NodeTaskTypeOptionalField> &
    Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>>,
  T2 extends NodeTaskPrototype
>(this: void, tableName: T | null, fields: T1 | null, prototype: T2) {
  const initial: Pick<NodeTaskField, "guid" | NodeTaskTypeOptionalField> = {
    guid: uuid.v4() as NodeTaskId,
    name: tableName ?? "TASK",
    enabled: true,
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
  return (x as any)?.run != null;
}
