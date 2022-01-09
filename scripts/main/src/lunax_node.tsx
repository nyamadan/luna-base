import "luna-base";
import { Command, CommandState } from "luna-base/dist/gl_renderer/node";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import {
  createTask,
  createTaskRef,
  NodeTaskType,
} from "luna-base/dist/gl_renderer/node_task";
import LunaX from "luna-base/dist/gl_renderer/lunax";
import NodeTask from "luna-base/dist/gl_renderer/components/task_component";
import ImageTask from "luna-base/dist/gl_renderer/components/image_task";
import GeometryTask from "luna-base/dist/gl_renderer/components/geometry_task";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";
import { ImageTaskType } from "luna-base/dist/gl_renderer/image_task";
import SubMeshTask from "luna-base/dist/gl_renderer/components/sub_mesh_task";
import Node from "luna-base/dist/gl_renderer/components/node_component";
import { GeometryTaskType } from "luna-base/dist/gl_renderer/geometry_task";
import { TextureTaskType } from "luna-base/dist/gl_renderer/texture_task";
import TextureTask from "luna-base/dist/gl_renderer/components/texture_task";

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
    <NodeTask task={createTask(null, { name: "Root" }, runner)}>
      <Node>
        {/* <SubMeshTask> */}
          <TextureTask name="color">
            <ImageTask path="./scripts/luna-base/tests/assets/waterfall-512x512.png" />
          </TextureTask>
          <GeometryTask generator={createPlaneGeometryXY} />
        {/* </SubMeshTask> */}
      </Node>
    </NodeTask>
  );
}
