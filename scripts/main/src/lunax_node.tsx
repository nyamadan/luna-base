import "luna-base";
import { createF32Vec4 } from "luna-base/dist/buffers/f32array";
import GeometryTask from "luna-base/dist/gl_renderer/components/geometry_task";
import ImageTask from "luna-base/dist/gl_renderer/components/image_task";
import MaterialTask from "luna-base/dist/gl_renderer/components/material_task";
import ShaderProgramTask from "luna-base/dist/gl_renderer/components/shader_program_task";
import ShaderTask from "luna-base/dist/gl_renderer/components/shader_task";
import SubMeshTask from "luna-base/dist/gl_renderer/components/sub_mesh_task";
import NodeTask from "luna-base/dist/gl_renderer/components/task_component";
import TextureTask from "luna-base/dist/gl_renderer/components/texture_task";
import Vec4Task from "luna-base/dist/gl_renderer/components/vec4_task";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import LunaX from "luna-base/dist/gl_renderer/lunax";
import {
  Command,
  CommandState,
  createNodeTaskPrototype,
  createTask,
  NodeTaskPrototype
} from "luna-base/dist/gl_renderer/node_task";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";

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
  const runner: NodeTaskPrototype = createNodeTaskPrototype({
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
  });

  return (
    <NodeTask task={createTask(null, { name: "Root" }, runner)}>
      <SubMeshTask>
        <GeometryTask generator={createPlaneGeometryXY} />
        <MaterialTask>
          <ShaderProgramTask>
            <ShaderTask type="VERTEX_SHADER">
              {`#version 300 es
              in vec3 aPosition;
              in vec2 aUv;
              in vec4 aColor;

              out vec4 vColor;
              out vec2 vUv;

              uniform mat4 uWorld;

              void main() {
                vColor = aColor;
                vUv = aUv;
                gl_Position = uWorld * vec4(aPosition, 1.0);
              }
            `}
            </ShaderTask>
            <ShaderTask type="FRAGMENT_SHADER">
              {`#version 300 es
              precision highp float;

              uniform sampler2D uTexColor;
              
              in vec4 vColor;
              in vec2 vUv;

              out vec4 outColor;
              
              void main() {
                outColor = texture(uTexColor, vUv) * vColor;
              }
          `}
            </ShaderTask>
          </ShaderProgramTask>
          <TextureTask name="uTexColor">
            <ImageTask path="./scripts/luna-base/tests/assets/waterfall-512x512.png" />
          </TextureTask>

          <Vec4Task name="uColor" value={createF32Vec4([0, 0, 0, 1])} />
        </MaterialTask>
      </SubMeshTask>
    </NodeTask>
  );
}
