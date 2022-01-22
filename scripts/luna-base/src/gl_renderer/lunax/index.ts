import { safeUnreachable } from "../../unreachable";
import { isNodeTask, NodeTaskType } from "../tasks/node_task";
import { createTextTask } from "../tasks/text_task";

type TaskOrString = NodeTaskType | string;
type Component = (this: void, props: any) => NodeTaskType;

namespace LunaX {
  export function createElement(
    component: Component,
    props?: Parameters<Component>[0],
    ...children: ReadonlyArray<TaskOrString>
  ): NodeTaskType {
    const task = component(props ?? {});
    for (const child of children) {
      if (isNodeTask(child)) {
        task.addChild(child);
      } else if (typeof child === "string") {
        task.addChild(createTextTask({ text: child }));
      } else {
        safeUnreachable(child);
      }
    }

    return task;
  }
}

export default LunaX;
