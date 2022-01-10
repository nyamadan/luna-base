import "luna-base";
import { assertIsNotNull } from "luna-base/dist/type_utils";
import { createTexture } from "luna-base/dist/gl_renderer/texture";
import { createSubMesh } from "luna-base/dist/gl_renderer/sub_mesh";
import { createSubMeshTask } from "luna-base/dist/gl_renderer/sub_mesh_task";
import quat from "luna-base/dist/math/quat";
import vec3 from "luna-base/dist/math/vec3";
import { createImageTask } from "luna-base/dist/gl_renderer/image_task";
import { createBasicMaterial } from "luna-base/dist/gl_renderer/basic_shader_program";
import { imguiRenderNodes } from "luna-base/dist/gl_renderer/imgui_render_nodes";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";
import {
  Command,
  CommandState,
  createNullTask,
  createTask,
  nodeTaskPrototype,
  NodeTaskPrototype,
} from "luna-base/dist/gl_renderer/node_task";
import { createGeometryTask } from "luna-base/dist/gl_renderer/geometry_task";

export default function createRotateImageNode(this: void) {
  const imageTask = createImageTask({
    path: "./scripts/luna-base/tests/assets/waterfall-512x512.png",
  });

  const geometryTask = createGeometryTask({
    generator: () => createPlaneGeometryXY(2, 2, 1, 1),
  });

  const root = createNullTask({
    name: "Root",
    children: [geometryTask, imageTask],
  });

  const update = coroutine.create(function (
    this: void,
    task: Command["task"],
    state: CommandState
  ) {
    const node0 = createNullTask({
      name: "SubMesh",
      tasks: [
        createSubMeshTask({
          subMesh: createSubMesh({
            geometryTaskGuid: geometryTask.guid,
            material: createBasicMaterial(createTexture(imageTask.guid)),
          }),
        }),
      ],
    });
    task.addTask(node0);

    const node1 = createNullTask({
      name: "SubMesh",
      tasks: [
        createSubMeshTask({
          subMesh: createSubMesh({
            geometryTaskGuid: geometryTask.guid,
            material: createBasicMaterial(createTexture(imageTask.guid)),
          }),
        }),
      ],
    });
    task.addTask(node1);

    let frame = 0;
    let running = true;
    while (running) {
      const rotation = frame * 0.02;
      const node1Transform = node1.transform;
      assertIsNotNull(node1Transform);
      quat.rotateZ(node1Transform.rotation, quat.create(), rotation);
      const scale = 0.25 * math.sin(rotation) + 0.75;
      vec3.set(node1Transform.scale, scale, scale, scale);

      coroutine.yield() as LuaMultiReturn<[Command["task"]]>;
      frame += 1;
    }
  });

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
          imguiRenderNodes(root);
          return state;
        }
        default: {
          return state;
        }
      }
    },
    ...nodeTaskPrototype,
  };

  root.addTask(
    createNullTask({
      name: "Script",
      tasks: [createTask(null, { name: "Runner" }, runner)],
    })
  );

  return root;
}
