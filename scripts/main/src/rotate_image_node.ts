import "luna-base";
import { createBasicMaterial } from "luna-base/dist/gl_renderer/basic_shader_program";
import { createPlaneGeometryXY } from "luna-base/dist/gl_renderer/primitives";
import { createSubMesh } from "luna-base/dist/gl_renderer/sub_mesh";
import { createGeometryTask } from "luna-base/dist/gl_renderer/tasks/geometry_task";
import { createImageTask } from "luna-base/dist/gl_renderer/tasks/image_task";
import { createImguiRenderNodesTask } from "luna-base/dist/gl_renderer/tasks/imgui_render_nodes_task";
import {
  CommandState,
  createNodeTaskPrototype,
  createTask,
  NodeTaskPrototype,
  NodeTaskType,
} from "luna-base/dist/gl_renderer/tasks/node_task";
import { createNullTask } from "luna-base/dist/gl_renderer/tasks/null_task";
import { createSubMeshTask } from "luna-base/dist/gl_renderer/tasks/sub_mesh_task";
import { createTexture } from "luna-base/dist/gl_renderer/texture";
import { assertBasicTransform } from "luna-base/dist/gl_renderer/transforms/basic_transform";
import quat from "luna-base/dist/math/quat";
import vec3 from "luna-base/dist/math/vec3";

export default function createRotateImageNode(this: void) {
  const imageTask = createImageTask({
    path: "./scripts/luna-base-test/assets/waterfall-512x512.png",
  });

  const geometryTask = createGeometryTask({
    generator: () =>
      createPlaneGeometryXY({
        width: 2,
        height: 2,
        subdivisionsWidth: 1,
        subdivisionsHeight: 1,
      }),
  });

  const root = createNullTask({
    name: "Root",
    children: [geometryTask, imageTask],
  });

  const update = coroutine.create(function (
    this: void,
    node: NodeTaskType,
    state: CommandState
  ) {
    const task0 = createNullTask({
      name: "SubMesh",
      tasks: [createImguiRenderNodesTask()],
      children: [
        createSubMeshTask({
          subMesh: createSubMesh({
            geometryTaskGuid: geometryTask.guid,
            material: createBasicMaterial(createTexture(imageTask.guid)),
          }),
        }),
      ],
    });
    node.addChild(task0);

    const task1 = createNullTask({
      name: "SubMesh",
      children: [
        createSubMeshTask({
          subMesh: createSubMesh({
            geometryTaskGuid: geometryTask.guid,
            material: createBasicMaterial(createTexture(imageTask.guid)),
          }),
        }),
      ],
    });
    node.addChild(task1);

    let frame = 0;
    let running = true;
    while (running) {
      const rotation = frame * 0.02;
      const task1Transform = task1.transform;
      assertBasicTransform(task1Transform);
      quat.rotateZ(task1Transform.rotation, quat.create(), rotation);
      const scale = 0.25 * math.sin(rotation) + 0.75;
      vec3.set(task1Transform.scale, scale, scale, scale);

      coroutine.yield();
      frame += 1;
    }
  });

  const runner: NodeTaskPrototype = createNodeTaskPrototype({
    run(command, state) {
      const { name, node } = command;
      switch (name) {
        case "update": {
          if (coroutine.status(update) === "suspended") {
            coroutine.resume(update, node, state);
          }

          return state;
        }
        default: {
          return state;
        }
      }
    },
  });

  root.addChild(
    createNullTask({
      name: "Script",
      children: [createTask(null, { name: "Runner" }, runner)],
    })
  );

  return root;
}
