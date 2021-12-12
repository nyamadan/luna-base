import "luna-base";
import {
  Command,
  CommandState,
  createNode,
  createScriptTask,
  NodeTask,
} from "luna-base/dist/gl_renderer/node";
import { assertIsNotNull } from "luna-base/dist/type_utils";
import { createMaterial } from "luna-base/dist/gl_renderer/material";
import { createGeometry } from "luna-base/dist/gl_renderer/geometry";
import { createTexture } from "luna-base/dist/gl_renderer/texture";
import { createSubMesh } from "luna-base/dist/gl_renderer/sub_mesh";
import { createImage } from "luna-base/dist/gl_renderer/image";
import { createSubMeshTask } from "luna-base/dist/gl_renderer/sub_mesh_task";
import { quat } from "luna-base/dist/math/quat";
import { vec3 } from "luna-base/dist/math/vec3";

export default function createRotateImageNode(this: void) {
  const root = createNode();

  const update = coroutine.create(function (this: void, node: Command["node"]) {
    const image = createImage(
      "./scripts/luna-base/tests/assets/waterfall-512x512.png"
    );
    const material = createMaterial("BASIC", createTexture(image));
    const geom = createGeometry({
      // prettier-ignore
      positions: [
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
      ],
      // prettier-ignore
      uv0s: [
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0
      ],
      // prettier-ignore
      colors: [
        0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      ],
      indices: [0, 2, 1, 1, 2, 3],
    });
    const subMesh = createSubMesh(geom, material);
    const subMeshTask = createSubMeshTask(subMesh);

    let frame = 0;

    node.addChild(
      createNode({
        tasks: [subMeshTask],
      })
    );

    let running = true;
    while (running) {
      const [node] = coroutine.yield() as LuaMultiReturn<[Command["node"]]>;
      const rotation = frame * 0.02;
      const rootTransform = node.findTransform();
      assertIsNotNull(rootTransform);
      quat.rotateZ(rootTransform.rotation, quat.create(), rotation);
      const scale = 0.25 * math.sin(rotation) + 0.75;
      vec3.set(rootTransform.scale, scale, scale, scale);
      frame += 1;
    }
  });

  type Runner<U = any> = (
    this: ScriptTask,
    command: Command,
    state: CommandState<U>
  ) => CommandState<U>;

  interface ScriptTask extends NodeTask {
    run: Runner<string>;
  }

  const runner: Omit<ScriptTask, "id"> = {
    run(command, state) {
      const { name, node } = command;
      switch (name) {
        case "update": {
          if (coroutine.status(update) === "suspended") {
            coroutine.resume(update, node);
          }

          return state;
        }
        default: {
          return state;
        }
      }
    },
  };

  const scriptTask = createScriptTask(runner);

  root.addChild(
    createNode({
      tasks: [scriptTask],
    })
  );

  return root;
}