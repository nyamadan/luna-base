import "luna-base";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import {
  Command,
  CommandState,
  createTask,
  nodeTaskPrototype,
  NodeTaskPrototype,
} from "luna-base/dist/gl_renderer/node_task";
import LunaX from "luna-base/dist/gl_renderer/lunax";
import NodeTask from "luna-base/dist/gl_renderer/components/task_component";
import ImageTask from "luna-base/dist/gl_renderer/components/image_task";
import GeometryTask from "luna-base/dist/gl_renderer/components/geometry_task";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";
import SubMeshTask from "luna-base/dist/gl_renderer/components/sub_mesh_task";
import TextureTask from "luna-base/dist/gl_renderer/components/texture_task";
import MaterialTask from "luna-base/dist/gl_renderer/components/material_task";

const update = coroutine.create(function (
  this: void,
  task: Command["task"],
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
  const runner: NodeTaskPrototype = {
    run(command, state) {
      const { name, task } = command;
      switch (name) {
        case "update": {
          if (coroutine.status(update) === "suspended") {
            coroutine.resume(update, task, state);
          }
          return state;
        }
        case "render": {
          imguiRenderNodes(task);
          return state;
        }
        default: {
          return state;
        }
      }
    },
    ...nodeTaskPrototype,
  };

  return (
    <NodeTask task={createTask(null, { name: "Root" }, runner)}>
      <SubMeshTask>
        <GeometryTask generator={createPlaneGeometryXY} />
        <MaterialTask>
          <TextureTask name="color">
            <ImageTask path="./scripts/luna-base/tests/assets/waterfall-512x512.png" />
          </TextureTask>
        </MaterialTask>
      </SubMeshTask>
    </NodeTask>
  );
}
