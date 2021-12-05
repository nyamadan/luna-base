import "luna-base";
import * as imgui from "imgui";
import { createApplicationTask } from "luna-base/dist/gl_renderer/application_task";
import { createNode, createScriptTask } from "luna-base/dist/gl_renderer/node";
import { showDemoWindow } from "imgui";
import { createPngImage } from "luna-base/dist/images/png_image";
import { assertIsNotNull, assertIsNull } from "luna-base/dist/type_utils";
import { createMaterial } from "luna-base/dist/gl_renderer/material";
import { createGeometry } from "luna-base/dist/gl_renderer/geometry";
import { createTexture } from "luna-base/dist/gl_renderer/texture";
import { createSubMesh } from "luna-base/dist/gl_renderer/sub_mesh";
import { createSubMeshTask } from "luna-base/dist/gl_renderer/sub_mesh_task";
import { quat } from "luna-base/dist/math/quat";
import { vec3 } from "luna-base/dist/math/vec3";

const root = createNode({
  tasks: [createApplicationTask()],
});
root.start({ worlds: {} });

const imageResult = createPngImage(
  "./scripts/luna-base/tests/assets/waterfall-512x512.png"
);
assertIsNull(imageResult[0]);
const image = imageResult[1];

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

let frame = 0.0;

const scriptTask = createScriptTask({
  run: function (command, state) {
    const { name, node } = command;
    switch (name) {
      case "update": {
        const rotation = frame * 0.02;
        const rootTransform = node.findTransform();
        assertIsNotNull(rootTransform);
        quat.rotateZ(rootTransform.rotation, quat.create(), rotation);
        const scale = 0.25 * math.sin(rotation) + 0.75;
        vec3.set(rootTransform.scale, scale, scale, scale);
        frame += 1;
        return state;
      }
      case "render": {
        showDemoWindow();

        if (imgui.begin("Hello World")) {
          imgui.text("Button");
          if (imgui.button("PUSH ME")) {
            print("PUSHED!");
          }
        }
        imgui.end();

        return state;
      }
      default: {
        return state;
      }
    }
  },
});

root.addChild(
  createNode({
    tasks: [scriptTask],
    children: [
      createNode({
        tasks: [subMeshTask],
      }),
    ],
  })
);
