import "luna-base";
import { createF32Vec4 } from "luna-base/dist/buffers/f32array";
import LunaX from "luna-base/dist/gl_renderer/lunax";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";
import { isApplicationTask } from "luna-base/dist/gl_renderer/tasks/application_task";
import GeometryTask, {
    GeometryTaskType,
    isGeometryTask
} from "luna-base/dist/gl_renderer/tasks/geometry_task";
import ImageTask from "luna-base/dist/gl_renderer/tasks/image_task";
import { createImguiRenderNodesTask } from "luna-base/dist/gl_renderer/tasks/imgui_render_nodes_task";
import MaterialTask from "luna-base/dist/gl_renderer/tasks/material_task";
import NodeTask, {
    createNodeTaskPrototype,
    createTask,
    NodeTaskPrototype
} from "luna-base/dist/gl_renderer/tasks/node_task";
import ShaderProgramTask from "luna-base/dist/gl_renderer/tasks/shader_program_task";
import ShaderTask from "luna-base/dist/gl_renderer/tasks/shader_task";
import SubMeshTask, {
    isSubMeshTask,
    SubMeshTaskType
} from "luna-base/dist/gl_renderer/tasks/sub_mesh_task";
import TextureTask from "luna-base/dist/gl_renderer/tasks/texture_task";
import Vec4Task from "luna-base/dist/gl_renderer/tasks/vec4_task";
import { assertBasicTransform } from "luna-base/dist/gl_renderer/transforms/basic_transform";
import {
    assertOrthoCameraTransform,
    createOrthoCameraTransform
} from "luna-base/dist/gl_renderer/transforms/ortho_camera_transform";
import { dbg } from "luna-base/dist/logger";
import { assertIsNotNull } from "luna-base/dist/type_utils";

export default function createDynamicVerticesNode(this: void) {
  const runner: NodeTaskPrototype = createNodeTaskPrototype({
    run(command, state) {
      const { name, source } = command;
      switch (name) {
        case "update": {
          const appTask = source.findTask(isApplicationTask);
          if (appTask == null) {
            return state;
          }

          assertOrthoCameraTransform(this.transform);

          this.transform.lookAt([0, 0, 1], [0, 0, 0], [0, 1, 0]);

          const subMeshTask = this.findTask(
            (x): x is SubMeshTaskType =>
              isSubMeshTask(x) && x.name === "x-sub-mesh"
          );

          if (subMeshTask == null) {
            return state;
          }

          const tr = subMeshTask.transform;
          assertBasicTransform(tr);

          const geomTask = this.findTask(
            (x): x is GeometryTaskType =>
              isGeometryTask(x) && x.name === "x-geom"
          );
          assertIsNotNull(geomTask);

          const geom = state.geometries[geomTask.guid];
          assertIsNotNull(geom);

          // TODO: UPDATE GEOMETRY
          geom.positions.buffer[0] = -1.0 * Math.random();

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
          tasks: [createImguiRenderNodesTask()],
        },
        runner
      )}
    >
      <SubMeshTask name="x-sub-mesh">
        <GeometryTask
          name="x-geom"
          generator={function CreatePlaneGeometryXY() {
            const geom = createPlaneGeometryXY();
            geom.positions.usage = "dynamic";
            return geom;
          }}
        />
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
