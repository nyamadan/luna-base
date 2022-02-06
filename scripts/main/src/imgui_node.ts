import * as imgui from "imgui";
import { showDemoWindow } from "imgui";
import "luna-base";
import { createI32Array } from "luna-base/dist/buffers/i32array";
import { createImguiRenderNodesTask } from "luna-base/dist/gl_renderer/tasks/imgui_render_nodes_task";
import {
  createNodeTaskPrototype,
  createTask,
} from "luna-base/dist/gl_renderer/tasks/node_task";
import { createNullTask } from "luna-base/dist/gl_renderer/tasks/null_task";
import { logger } from "luna-base/dist/logger";

export default function createImguiNode(this: void) {
  const root = createNullTask({
    tasks: [createImguiRenderNodesTask()],
  });

  const render = coroutine.create(function (this: void) {
    const e = createI32Array(1);
    e.setElement(0, 0);

    let running = true;
    while (running) {
      showDemoWindow();

      if (imgui.begin("Hello World")) {
        imgui.text("This is Text");

        imgui.radioButton("Radio0", e.buffer, 0);
        imgui.sameLine();
        imgui.radioButton("Radio1", e.buffer, 1);
        imgui.sameLine();
        imgui.radioButton("Radio2", e.buffer, 2);

        if (imgui.button("PUSH ME")) {
          logger.debug(`Radio: ${e.getElement(0)}`);
        }

        if (imgui.treeNode("MyTree")) {
          if (imgui.treeNode("YourTree")) {
            imgui.text("Hello");
            imgui.treePop();
          }
          imgui.treePop();
        }
      }
      imgui.end();

      coroutine.yield();
    }
  });

  const scriptTask = createTask(
    null,
    {},
    createNodeTaskPrototype({
      run(command, state) {
        const { name, node } = command;
        switch (name) {
          case "render": {
            coroutine.resume(render, node);
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

  return root;
}
