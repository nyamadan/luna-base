import "luna-base";
import * as imgui from "imgui";
import {
  Command,
  createNode,
  createScriptTask,
} from "luna-base/dist/gl_renderer/node";
import { showDemoWindow } from "imgui";

export default function createImguiNode(this: void) {
  const root = createNode();

  const render = coroutine.create(function (this: void) {
    let running = true;
    while (running) {
      showDemoWindow();

      if (imgui.begin("Hello World")) {
        imgui.text("Button");
        if (imgui.button("PUSH ME")) {
          print("PUSHED!");
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
