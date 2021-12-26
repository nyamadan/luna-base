import "luna-base";
import {
  Command,
  CommandState,
  createNode,
  createScriptTask,
  NodeTask,
} from "luna-base/dist/gl_renderer/node";
import { assertIsNotNull } from "luna-base/dist/type_utils";
import { createGeometry } from "luna-base/dist/gl_renderer/geometry";
import { createTexture } from "luna-base/dist/gl_renderer/texture";
import { createSubMesh } from "luna-base/dist/gl_renderer/sub_mesh";
import { createSubMeshTask } from "luna-base/dist/gl_renderer/sub_mesh_task";
import { quat } from "luna-base/dist/math/quat";
import { vec3 } from "luna-base/dist/math/vec3";
import {
  appendImageNode,
  loadImageFromState,
} from "luna-base/dist/gl_renderer/image_task";
import { createBasicMaterial } from "luna-base/dist/gl_renderer/basic_shader_program";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import { createPlaneVertices } from "luna-base/dist/gl_renderer/primitives";
import { mat4 } from "luna-base/dist/math/mat4";

export default function createRotateImageNode(this: void) {
  const root = createNode({ name: "Root" });

  const imageNode = appendImageNode(
    root,
    "./scripts/luna-base/tests/assets/waterfall-512x512.png",
    { name: "Image" }
  );

  const update = coroutine.create(function (
    this: void,
    node: Command["node"],
    state: CommandState
  ) {
    const image = loadImageFromState(state, imageNode.id);
    assertIsNotNull(image);

    let m = mat4.create();
    mat4.rotateX(m, m, -0.5 * Math.PI);

    const node1 = createNode({
      name: "SubMesh",
      tasks: [
        createSubMeshTask(
          createSubMesh(
            createGeometry(createPlaneVertices(2, 2, 1, 1, m)),
            createBasicMaterial(createTexture(image))
          )
        ),
      ],
    });
    node.addChild(node1);

    const node2 = createNode({
      name: "SubMesh",
      tasks: [
        createSubMeshTask(
          createSubMesh(
            createGeometry(createPlaneVertices(2, 2, 1, 1, m)),
            createBasicMaterial(createTexture(image))
          )
        ),
      ],
    });
    // bug?
    // node.addChild(node2);

    let frame = 0;
    let running = true;
    while (running) {
      const rotation = frame * 0.02;
      const node1Transform = node1.findTransform();
      assertIsNotNull(node1Transform);
      quat.rotateZ(node1Transform.rotation, quat.create(), rotation);
      const scale = 0.25 * math.sin(rotation) + 0.75;
      vec3.set(node1Transform.scale, scale, scale, scale);

      coroutine.yield() as LuaMultiReturn<[Command["node"]]>;
      frame += 1;
    }
  });

  type Runner<U> = (
    this: ScriptTask,
    command: Command,
    state: CommandState<U>
  ) => CommandState<U>;

  interface UserState {}

  interface ScriptTask extends NodeTask {
    run: Runner<UserState>;
  }

  type ScriptTaskNoId = Omit<ScriptTask, "id">;

  const runner: ScriptTaskNoId = {
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
          imguiRenderNodes(root);
          return state;
        }
        default: {
          return state;
        }
      }
    },
  };

  root.addChild(
    createNode({
      name: "Script",
      tasks: [createScriptTask(runner)],
    })
  );

  return root;
}
