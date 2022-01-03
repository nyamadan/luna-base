import "luna-base";
import {
  Command,
  CommandState,
  createNode,
} from "luna-base/dist/gl_renderer/node";
import { assertIsNotNull } from "luna-base/dist/type_utils";
import { createTexture } from "luna-base/dist/gl_renderer/texture";
import { createSubMesh } from "luna-base/dist/gl_renderer/sub_mesh";
import { createSubMeshTask } from "luna-base/dist/gl_renderer/sub_mesh_task";
import quat from "luna-base/dist/math/quat";
import vec3 from "luna-base/dist/math/vec3";
import {
  createImageTask,
  loadImageFromState,
} from "luna-base/dist/gl_renderer/image_task";
import { createBasicMaterial } from "luna-base/dist/gl_renderer/basic_shader_program";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";
import { createTask, NodeTaskType } from "luna-base/dist/gl_renderer/node_task";

export default function createRotateImageNode(this: void) {
  const imageTask = createImageTask({
    path: "./scripts/luna-base/tests/assets/waterfall-512x512.png",
  });
  const root = createNode({ name: "Root", tasks: [imageTask] });

  const update = coroutine.create(function (
    this: void,
    node: Command["node"],
    state: CommandState
  ) {
    const image = loadImageFromState(state, imageTask.id);
    assertIsNotNull(image);

    const node0 = createNode({
      name: "SubMesh",
      tasks: [
        createSubMeshTask(
          createSubMesh(
            createPlaneGeometryXY(2, 2, 1, 1),
            createBasicMaterial(createTexture(image))
          )
        ),
      ],
    });
    node.addChild(node0);

    const node1 = createNode({
      name: "SubMesh",
      tasks: [
        createSubMeshTask(
          createSubMesh(
            createPlaneGeometryXY(2, 2, 1, 1),
            createBasicMaterial(createTexture(image))
          )
        ),
      ],
    });
    node.addChild(node1);

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

  interface ScriptTask extends NodeTaskType {
    run: Runner<UserState>;
  }

  type ScriptTaskNoId = Pick<ScriptTask, "run">;

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
      tasks: [createTask(null, {}, runner)],
    })
  );

  return root;
}
