import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskPrototype,
} from "./node_task";

const nullTaskPrototype: NodeTaskPrototype = createNodeTaskPrototype({
  run: (_, state) => state,
});

export function createNullTask<T extends Parameters<typeof createTask>[1]>(
  params?: T
) {
  return createTask(null, params ?? {}, nullTaskPrototype);
}

export default function NullTask(
  this: void,
  ...params: Parameters<typeof createNullTask>
) {
  return createNullTask(...params);
}
