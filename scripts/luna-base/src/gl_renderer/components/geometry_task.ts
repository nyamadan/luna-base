import { NodeTaskField, NodeTaskProps, pickOptionalField } from "../node_task";
import {
  createGeometryTask,
  GeometryTaskField,
  GeometryTaskType,
} from "../geometry_task";

export default function GeometryTask(
  this: void,
  params: NodeTaskProps<
    GeometryTaskField & {
      onCreate: (this: void, task: GeometryTaskType) => void;
    },
    "generator",
    "onCreate"
  >
) {
  const { generator, onCreate } = params;
  const task = createGeometryTask({
    ...pickOptionalField(params),
    ...{
      generator,
    },
  });
  onCreate?.(task);
  return task;
}
