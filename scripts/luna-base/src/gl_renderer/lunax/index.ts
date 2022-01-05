import { safeUnreachable } from "../../unreachable";
import { createNode, isNode, NodeType } from "../node";
import { isNodeTask, NodeTaskType } from "../node_task";

type NodeOrTask = NodeTaskType | NodeType;
type Component = (this: void, props: any) => NodeOrTask;

namespace LunaX {
  export function createElement(
    component: Component,
    props?: Parameters<Component>[0],
    ...children: ReadonlyArray<NodeOrTask>
  ): NodeOrTask {
    const nodeOrTask = component(props);
    if (isNode(nodeOrTask)) {
      const node = nodeOrTask;
      for (const child of children) {
        if (isNode(child)) {
          node.addChild(child);
        } else if (isNodeTask(child)) {
          node.addChild(
            createNode({
              name: `NODE: ${child.name}`,
              tasks: [child],
            })
          );
        } else {
          safeUnreachable(child);
        }
      }
      return node;
    } else if (isNodeTask(nodeOrTask)) {
      const task = nodeOrTask;
      const node = createNode({
        name: `NODE: ${task.name}`,
        tasks: [task],
      });
      for (const child of children) {
        if (isNode(child)) {
          node.addChild(child);
        } else if (isNodeTask(child)) {
          node.addChild(
            createNode({
              name: `NODE: ${child.name}`,
              tasks: [child],
            })
          );
        } else {
          safeUnreachable(child);
        }
      }

      return node;
    }

    safeUnreachable(nodeOrTask);
  }
}

export default LunaX;
