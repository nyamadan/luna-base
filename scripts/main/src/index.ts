import "luna-base";
import * as imgui from "imgui";
import { createApplicationTask } from "luna-base/dist/gl_renderer/application_task";
import createRotateImageNode from "./rotate_image_node";
import createImguiNode from "./imgui_node";
import createLunaXNode from "./lunax_node";
import { createI32Array } from "luna-base/dist/buffers/i32array";
import {
  createTask,
  initCommandState,
  nodeTaskPrototype,
  NodeTaskType,
} from "luna-base/dist/gl_renderer/node_task";
import { createGLRendererTask } from "luna-base/dist/gl_renderer/gl_renderer_task";

const app = createApplicationTask();
const root = createGLRendererTask();
app.addChild(root);
app.setup(initCommandState(null));

const rotateImage = createRotateImageNode();
root.addChild(rotateImage);

const imguiNode = createImguiNode();
root.addChild(imguiNode);

const lunaxNode = createLunaXNode();
root.addChild(lunaxNode);

const nodes: { name: string; node: NodeTaskType }[] = [
  {
    name: "LunaX",
    node: lunaxNode,
  },
  {
    name: "ImGui",
    node: imguiNode,
  },
  {
    name: "Rotate",
    node: rotateImage,
  },
];
for (const [index, { node }] of nodes.entries()) {
  node.enabled = index === 0;
}

const render = coroutine.create(function (this: void) {
  let running = true;

  const e = createI32Array(1);
  e.setElement(0, 0);

  while (running) {
    if (imgui.begin("Examples")) {
      for (let i = 0; i < nodes.length; i++) {
        const { name } = nodes[i];
        imgui.radioButton(name, e.buffer, i);
      }
    }
    imgui.end();

    const selected = e.getElement(0);
    for (let i = 0; i < nodes.length; i++) {
      const { node } = nodes[i];
      node.enabled = selected === i;
    }

    coroutine.yield();
  }
});

const scriptTask = createTask(
  null,
  {},
  {
    run: function (command, state) {
      const { name, task } = command;
      switch (name) {
        case "render": {
          if (coroutine.status(render) === "suspended") {
            coroutine.resume(render, task);
          }
          return state;
        }
        default: {
          return state;
        }
      }
    },
    ...nodeTaskPrototype,
  }
);

root.addChild(scriptTask);
