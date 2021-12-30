import { allocTableName, createTable, TableName } from "../tables";
import { uuid } from "../uuid";
import { Command, CommandState } from "./node";

const SCRIPT_TASK_TABLE_NAME = allocTableName("LUA_TYPE_SCRIPT_TASK");

export type NodeTaskId = string & { __node_task: never };

export interface NodeTaskField {
  readonly id: NodeTaskId;
  enabled: boolean;
}

export interface NodeTaskPrototype<T extends NodeTask = NodeTask, U = any> {
  run(this: T, command: Command, state: CommandState<U>): CommandState<U>;
}

export type NodeTask = NodeTaskField & NodeTaskPrototype;

export function createTask<
  T extends TableName,
  T1 extends Omit<NodeTaskField, "id" | "enabled">,
  T2 extends NodeTaskPrototype
>(this: void, tableName: T, fields: T1, prototype: T2) {
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

export function createScriptTask<T extends NodeTask = NodeTask>(
  this: void,
  task: Omit<T, "id" | "enabled"> & { enabled?: boolean }
) {
  const fields: Pick<T, "id" | "enabled"> = {
    id: uuid.v4() as NodeTaskId,
    enabled: true,
  };
  return createTable(SCRIPT_TASK_TABLE_NAME, { ...fields, ...task });
}
