import * as imgui from "imgui";
import { allocTableName, getMetatableName } from "../../tables";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  NodeTaskType,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_IMGUI_RENDER_NODES_TASK");

export type ImguiRenderNodesTaskId = NodeTaskId & { __imgui_task: never };

export interface ImguiRenderNodesTaskField
  extends NodeTaskField<ImguiRenderNodesTaskId, ImguiRenderNodesTaskType> {}

export interface ImguiRenderNodesTaskPrototype
  extends NodeTaskPrototype<ImguiRenderNodesTaskType> {}

export type ImguiRenderNodesTaskType = ImguiRenderNodesTaskField &
  ImguiRenderNodesTaskPrototype;

function renderNodes(this: void, task: NodeTaskType) {
  if (!task.enabled) {
    return;
  }

  if (imgui.treeNode(task.guid, task.name)) {
    for (const t of task.tasks) {
      imgui.text(t.name);
    }

    for (const child of task.children) {
      renderNodes(child);
    }
    imgui.treePop();
  }
}

const prototype: ImguiRenderNodesTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    switch (command.name) {
      case "render": {
        if (imgui.begin("Nodes")) {
          renderNodes(command.source);
        }
        imgui.end();
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createImguiRenderNodesTask(
  this: void,
  params: NodeTaskProps<ImguiRenderNodesTaskField, never, never> = {}
): ImguiRenderNodesTaskType {
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
    },
    prototype
  ) as ImguiRenderNodesTaskType;
}

export function isImguiRenderNodesTask(
  this: void,
  x: unknown
): x is ImguiRenderNodesTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function ImguiRenderNodesTask(
  this: void,
  ...params: Parameters<typeof createImguiRenderNodesTask>
) {
  return createImguiRenderNodesTask(...params);
}
