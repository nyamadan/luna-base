import "luna-base";
import { createF32Vec4 } from "luna-base/dist/buffers/f32array";
import { isApplicationTask } from "luna-base/dist/gl_renderer/application_task";
import { assertBasicTransform } from "luna-base/dist/gl_renderer/basic_transform";
import GeometryTask from "luna-base/dist/gl_renderer/geometry_task";
import ImageTask from "luna-base/dist/gl_renderer/image_task";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import LunaX from "luna-base/dist/gl_renderer/lunax";
import MaterialTask from "luna-base/dist/gl_renderer/material_task";
import NodeTask, {
  createNodeTaskPrototype,
  createTask,
  NodeTaskPrototype,
} from "luna-base/dist/gl_renderer/node_task";
import { createOrthoCameraTransform } from "luna-base/dist/gl_renderer/ortho_camera_transform";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";
import ShaderProgramTask from "luna-base/dist/gl_renderer/shader_program_task";
import ShaderTask from "luna-base/dist/gl_renderer/shader_task";
import SubMeshTask, {
  isSubMeshTask,
  SubMeshTaskType,
} from "luna-base/dist/gl_renderer/sub_mesh_task";
import TextureTask from "luna-base/dist/gl_renderer/texture_task";
import Vec4Task from "luna-base/dist/gl_renderer/vec4_task";
import vec3 from "luna-base/dist/math/vec3";

export default function createLunaXNode(this: void) {
  const runner: NodeTaskPrototype = createNodeTaskPrototype({
    run(command, state) {
      const { name, node, source } = command;
      switch (name) {
        case "update": {
          const appTask = source.findTask(isApplicationTask);
          if (appTask == null) {
            return state;
          }

          const subMeshTask = this.findTask(
            (x): x is SubMeshTaskType =>
              isSubMeshTask(x) && x.name === "x-sub-mesh"
          );

          if (subMeshTask == null) {
            return state;
          }

          const tr = subMeshTask.transform;
          assertBasicTransform(tr);
          vec3.set(tr.position, 0, 0, -1);
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
  });

  return (
    <NodeTask
      task={createTask(
        null,
        {
          name: "Root",
          transform: createOrthoCameraTransform({
            left: -1.0,
            right: 1.0,
            top: 1.0,
            bottom: -1.0,
          }),
        },
        runner
      )}
    >
      <SubMeshTask name="x-sub-mesh">
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
              uniform vec4 uColor;

              void main() {
                vColor = aColor * uColor;
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
            <ImageTask path="./scripts/luna-base-test/assets/waterfall-512x512.png" />
          </TextureTask>

          <Vec4Task name="uColor" value={createF32Vec4([1, 1, 1, 1])} />
        </MaterialTask>
      </SubMeshTask>
    </NodeTask>
  );
}
