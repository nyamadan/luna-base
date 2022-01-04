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
          node.addTask(child);
        } else {
          safeUnreachable(child);
        }
      }
      return node;
    } else if (isNodeTask(nodeOrTask)) {
      const task = nodeOrTask;
      let node: NodeType | null = null;
      for (const child of children) {
        if (isNode(child)) {
          if (node == null) {
            node = createNode({ name: `(NODE)${task.name}` });
            node.addTask(task);
          }
          node.addChild(child);
        } else if (isNodeTask(child)) {
          if (node == null) {
            node = createNode({ name: `(NODE)${task.name}` });
            node.addTask(task);
          }
          node.addTask(child);
        } else {
          safeUnreachable(child);
        }
      }

      return node ?? task;
    }

    safeUnreachable(nodeOrTask);
  }
}

export default LunaX;
