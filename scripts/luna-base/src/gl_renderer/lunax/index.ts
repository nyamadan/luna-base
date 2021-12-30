import { safeUnreachable } from "../../unreachable";
import { isNode, NodeType } from "../node";
import { isNodeTask, NodeTask } from "../node_task";

namespace LunaX {
  /** @noSelf */
  export function createElement(
    type: Function,
    props?: object,
    ...children: Array<NodeTask | NodeType>
  ): NodeTask | NodeType {
    const nodeOrTask: NodeTask | NodeType = type(props);
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
      return nodeOrTask;
    }

    safeUnreachable(nodeOrTask);
  }
}

export default LunaX;
