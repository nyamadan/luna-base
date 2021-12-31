import "luna-base";
import Node, { Command, CommandState } from "luna-base/dist/gl_renderer/node";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import NodeTask, { NodeTaskType } from "luna-base/dist/gl_renderer/node_task";
import LunaX from "luna-base/dist/gl_renderer/lunax";

const update = coroutine.create(function (
  this: void,
  node: Command["node"],
  state: CommandState
) {
  let frame = 0;
  let running = true;
  while (running) {
    print(frame);
    frame++;
    coroutine.yield();
  }
});

export default function createLunaXNode(this: void) {
  type Runner<U = any> = (
    this: ScriptTask,
    command: Command,
    state: CommandState<U>
  ) => CommandState<U>;

  type WithRunner = Pick<ScriptTask, "run">;

  interface ScriptTask extends NodeTaskType {
    run: Runner;
  }

  const runner: WithRunner = {
    run(command, state) {
      const { name, node } = command;
      switch (name) {
        case "update": {
          if (coroutine.status(update) === "suspended") {
            coroutine.resume(update, node, state);
          }

          return state;
        }
        case "render": {
          imguiRenderNodes(node);
          return state;
        }
        default: {
          return state;
        }
      }
    },
  };

  return (
    <Node name="Root">
      <NodeTask prototype={runner} />
    </Node>
  );
}
