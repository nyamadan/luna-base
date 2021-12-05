import "luna-base";
import { createApplicationTask } from "luna-base/dist/gl_renderer/application_task";
import { createNode, createScriptTask } from "luna-base/dist/gl_renderer/node";
import { showDemoWindow } from "imgui";

const root = createNode({
  tasks: [createApplicationTask()],
});

root.start({ worlds: {} });

root.addChild(
  createNode({
    tasks: [
      createScriptTask(function (command, state) {
        const { name } = command;
        switch (name) {
          case "update": {
            print("On Update");
            return state;
          }
          case "render": {
            showDemoWindow();
            return state;
          }
          default: {
            return state;
          }
        }
      }),
    ],
  })
);
