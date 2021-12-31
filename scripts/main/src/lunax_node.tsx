import "luna-base";
import { Command, CommandState } from "luna-base/dist/gl_renderer/node";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import { NodeTaskType } from "luna-base/dist/gl_renderer/node_task";
import LunaX from "luna-base/dist/gl_renderer/lunax";
import Node from "luna-base/dist/gl_renderer/components/node_component";
import NodeTask from "luna-base/dist/gl_renderer/components/task_component";

const update = coroutine.create(function (
  this: void,
  node: Command["node"],
  state: CommandState
) {
  let frame = 0;
  let running = true;
  while (running) {
    frame++;
    coroutine.yield();
  }
});

export default function createLunaXNode(this: void) {
  type Runner<U> = (
    this: ScriptTask<U>,
    command: Command,
    state: CommandState<U>
  ) => CommandState<U>;

  type WithRunner<U = any> = Pick<ScriptTask<U>, "run">;

  interface ScriptTask<U> extends NodeTaskType {
    run: Runner<U>;
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
