import * as imgui from "imgui";
import { NodeType } from "./node";

function _imguiRenderNodes(this: void, node: NodeType) {
  if (!node.enabled) {
    return;
  }

  if (imgui.treeNode(node.id, node.name)) {
    for (const task of node.tasks) {
      imgui.text(`${task.name}`);
    }

    for (const child of node.children) {
      _imguiRenderNodes(child);
    }
    imgui.treePop();
  }
}

export function imguiRenderNodes(node: NodeType) {
  if (imgui.begin("Nodes")) {
    _imguiRenderNodes(node);
  }
  imgui.end();
}
