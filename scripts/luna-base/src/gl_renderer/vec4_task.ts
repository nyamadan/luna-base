import { createF32Vec4, F32Vec4 } from "../buffers/f32array";
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

const TABLE_NAME = allocTableName("LUA_TYPE_VEC4_TASK");

export type Vec4TaskGuid = NodeTaskId & { __texture_task: never };

export interface Vec4TaskField
  extends NodeTaskField<Vec4TaskGuid, Vec4TaskType> {
  value: F32Vec4;
}

export interface Vec4TaskPrototype extends NodeTaskPrototype<Vec4TaskType> {}

export type Vec4TaskType = Vec4TaskField & Vec4TaskPrototype;

const prototype: Vec4TaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name } = command;
    switch (name) {
      default: {
        return state;
      }
    }
  },
});

export function createVec4Task(
  this: void,
  params: NodeTaskProps<Vec4TaskField, never, "value">
): Vec4TaskType {
  const field: Omit<Vec4TaskField, keyof NodeTaskField> = {
    value: params.value ?? createF32Vec4(),
  };

  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...field,
    },
    prototype
  ) as Vec4TaskType;
}

export function isVec4Task(this: void, x: unknown): x is Vec4TaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export function assertVec4Task(
  this: void,
  x: unknown
): asserts x is Vec4TaskType {
  assert(isVec4Task(x));
}

export default function Vec4Task(
  this: void,
  ...params: Parameters<typeof createVec4Task>
): Vec4TaskType {
  return createVec4Task(...params);
}
