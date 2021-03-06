import * as imgui from "imgui";
import "luna-base";
import { createI32Array } from "luna-base/dist/buffers/i32array";
import { createApplicationTask } from "luna-base/dist/gl_renderer/tasks/application_task";
import {
  createNodeTaskPrototype,
  createTask,
  initCommandState,
  NodeTaskType,
} from "luna-base/dist/gl_renderer/tasks/node_task";
import createDynamicVerticesNode from "./dynamic_vertices";
import createImguiNode from "./imgui_node";
import createLunaXNode from "./lunax_node";
import createRotateImageNode from "./rotate_image_node";

const root = createApplicationTask({ width: 1024, height: 768 });
root.setup(initCommandState(null));

const rotateImage = createRotateImageNode();
root.addChild(rotateImage);

const imguiNode = createImguiNode();
root.addChild(imguiNode);

const lunaxNode = createLunaXNode();
root.addChild(lunaxNode);

const dynamicVerticesNode = createDynamicVerticesNode();
root.addChild(dynamicVerticesNode);

const tasks: { name: string; task: NodeTaskType }[] = [
  {
    name: "DynamicVertices",
    task: dynamicVerticesNode,
  },
  {
    name: "LunaX",
    task: lunaxNode,
  },
  {
    name: "ImGui",
    task: imguiNode,
  },
  {
    name: "Rotate",
    task: rotateImage,
  },
];
for (const [index, { task }] of tasks.entries()) {
  task.enabled = index === 0;
}

const render = coroutine.create(function (this: void) {
  let running = true;

  const e = createI32Array(1);
  e.setElement(0, 0);

  while (running) {
    if (imgui.begin("Examples")) {
      for (let i = 0; i < tasks.length; i++) {
        const { name } = tasks[i];
        imgui.radioButton(name, e.buffer, i);
      }
    }
    imgui.end();

    const selected = e.getElement(0);
    for (let i = 0; i < tasks.length; i++) {
      const { task } = tasks[i];
      task.enabled = selected === i;
    }

    coroutine.yield();
  }
});

const scriptTask = createTask(
  null,
  {},
  createNodeTaskPrototype({
    run(command, state) {
      const { name } = command;
      switch (name) {
        case "render": {
          if (coroutine.status(render) === "suspended") {
            coroutine.resume(render, command.node);
          }
          return state;
        }
        default: {
          return state;
        }
      }
    },
  })
);

root.addChild(scriptTask);
