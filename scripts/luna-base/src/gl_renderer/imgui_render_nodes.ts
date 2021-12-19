import * as imgui from "imgui";
import { Node } from "./node";

function _imguiRenderNodes(this: void, node: Node) {
  if (!node.enabled) {
    return;
  }

  if (imgui.treeNode(node.id, node.name)) {
    for (const child of node.children) {
      _imguiRenderNodes(child);
    }
    imgui.treePop();
  }
}

export function imguiRenderNodes(node: Node) {
  if (imgui.begin("Tree Nodes")) {
    _imguiRenderNodes(node);
  }
  imgui.end();
}
