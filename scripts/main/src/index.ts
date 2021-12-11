import "luna-base";
import * as imgui from "imgui";
import { createApplicationTask } from "luna-base/dist/gl_renderer/application_task";
import { createNode, createScriptTask } from "luna-base/dist/gl_renderer/node";

import createRotateImageNode from "./rotate_image_node";
import createImguiNode from "./imgui_node";
import { createI32Array } from "luna-base/dist/buffers/i32array";

const root = createNode({
  tasks: [createApplicationTask()],
});
root.start({ worlds: {} });

const rotateImage = createRotateImageNode();
root.addChild(rotateImage);

const imguiNode = createImguiNode();
root.addChild(imguiNode);

const nodes = [
  {
    name: "ImGui",
    node: imguiNode,
  },
  {
    name: "Rotate",
    node: rotateImage,
  },
];

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

const scriptTask = createScriptTask({
  run: function (command, state) {
    const { name, node } = command;
    switch (name) {
      case "render": {
        if (coroutine.status(render) === "suspended") {
          coroutine.resume(render, node);
        }
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

root.addChild(
  createNode({
    tasks: [scriptTask],
  })
);
