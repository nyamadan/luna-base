import { allocTableName, getMetatableName } from "../tables";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_TEXT_TASK");

export type TextTaskId = NodeTaskId & { __text_task: never };
export interface TextTaskField extends NodeTaskField<TextTaskId, TextTaskType> {
  text: string;
}

export interface TextTaskPrototype extends NodeTaskPrototype<TextTaskType> {}

export type TextTaskType = TextTaskField & TextTaskPrototype;

const prototype: TextTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      default: {
        return state;
      }
    }
  },
});

export function createTextTask(
  this: void,
  params: NodeTaskProps<TextTaskField, never, "text">
): TextTaskType {
  const field: Omit<TextTaskField, keyof NodeTaskField> = {
    text: params?.text ?? "",
  };
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...field,
    },
    prototype
  ) as TextTaskType;
}

export function isTextTask(this: void, x: unknown): x is TextTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
