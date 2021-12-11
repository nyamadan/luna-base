import "luna-base";
import * as imgui from "imgui";
import { createNode, createScriptTask } from "luna-base/dist/gl_renderer/node";
import { showDemoWindow } from "imgui";
import { createI32Array } from "luna-base/dist/buffers/i32array";

export default function createImguiNode(this: void) {
  const root = createNode();

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
          print(`Radio: ${e.getElement(0)}`);
        }
      }
      imgui.end();

      coroutine.yield();
    }
  });

  const scriptTask = createScriptTask({
    run: function (command, state) {
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
  });

  root.addChild(
    createNode({
      tasks: [scriptTask],
    })
  );

  return root;
}
