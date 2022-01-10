import * as imgui from "imgui";
import { NodeTaskType } from "./node_task";

function _imguiRenderNodes(this: void, task: NodeTaskType) {
  if (!task.enabled) {
    return;
  }

  if (imgui.treeNode(task.guid, task.name)) {
    for (const t of task.tasks) {
      imgui.text(t.name);
    }

    for (const child of task.children) {
      _imguiRenderNodes(child);
    }
    imgui.treePop();
  }
}

export function imguiRenderNodes(this: void, task: NodeTaskType) {
  if (imgui.begin("Nodes")) {
    _imguiRenderNodes(task);
  }
  imgui.end();
}
