import { createGeometryTask } from "../geometry_task";

export default function GeometryTask(
  this: void,
  ...params: Parameters<typeof createGeometryTask>
) {
  return createGeometryTask(...params);
}
