import "luna-base";
import * as imgui from "imgui";
import { showDemoWindow } from "imgui";
import { createI32Array } from "luna-base/dist/buffers/i32array";
import { logger } from "luna-base/dist/logger";
import {
  createNullTask,
  createTask,
  nodeTaskPrototype,
} from "luna-base/dist/gl_renderer/node_task";

export default function createImguiNode(this: void) {
  const root = createNullTask();

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
    {
      run: function (command, state) {
        const { name, task } = command;
        switch (name) {
          case "render": {
            coroutine.resume(render, task);
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

  return root;
}
