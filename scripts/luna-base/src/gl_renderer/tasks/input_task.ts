import { dbg } from "../../logger";
import { allocTableName, getMetatableName } from "../../tables";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_INPUT_TASK");

export type InputTaskId = NodeTaskId & { __input_task: never };

export interface InputTaskField
  extends NodeTaskField<InputTaskId, InputTaskType> {}

export interface InputTaskPrototype extends NodeTaskPrototype<InputTaskType> {}

export type InputTaskType = InputTaskField & InputTaskPrototype;

const prototype: InputTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    switch (command.name) {
      case "input": {
        for (const ev of command.inputEvents) {
          dbg(ev);
        }
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createInputTask(
  this: void,
  params: NodeTaskProps<InputTaskField, never, never> = {}
): InputTaskType {
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...{},
    },
    prototype
  ) as InputTaskType;
}

export function isInputTask(this: void, x: unknown): x is InputTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function InputTask(
  this: void,
  ...params: Parameters<typeof createInputTask>
) {
  return createInputTask(...params);
}
