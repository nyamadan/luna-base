import "luna-base";
import { Command, CommandState } from "luna-base/dist/gl_renderer/node";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import { createTask, NodeTaskType } from "luna-base/dist/gl_renderer/node_task";
import LunaX from "luna-base/dist/gl_renderer/lunax";
import Node from "luna-base/dist/gl_renderer/components/node_component";
import NodeTask from "luna-base/dist/gl_renderer/components/task_component";
import ImageTask from "luna-base/dist/gl_renderer/components/image_task";
import { logger } from "luna-base/dist/logger";
import TextureImageNode from "luna-base/dist/gl_renderer/components/texture_image_node";
import MeshNode from "luna-base/dist/gl_renderer/components/mesh_node";

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
      <MeshNode>
        <TextureImageNode
          onLoad={function (task, node) {
            for (const texture of Object.values(task.textures)) {
              logger.debug("%s, %s", task.name, texture?.image?.path);
            }
          }}
        >
          <ImageTask path="./scripts/luna-base/tests/assets/waterfall-512x512.png" />
          <ImageTask path="./scripts/luna-base/tests/assets/waterfall-512x512.png" />
        </TextureImageNode>
      </MeshNode>
      <NodeTask task={createTask(null, null, runner)} />
    </Node>
  );
}
