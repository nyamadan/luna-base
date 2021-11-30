import "luna-base";
import * as _gl from "gl";
import {
  createGLRenderer,
  GLRenderer,
} from "luna-base/dist/gl_renderer/gl_renderer";
import { createPngImage } from "luna-base/dist/images/png_image";
import { assertIsNotNull, assertIsNull } from "luna-base/dist/type_utils";
import { createMaterial } from "luna-base/dist/gl_renderer/material";
import { createGeometry } from "luna-base/dist/gl_renderer/geometry";
import { createSubMesh } from "luna-base/dist/gl_renderer/sub_mesh";
import { createNode, Node } from "luna-base/dist/gl_renderer/node";
import { createTexture } from "luna-base/dist/gl_renderer/texture";
import { mat4 } from "luna-base/dist/math/mat4";
import { quat } from "luna-base/dist/math/quat";
import { vec3 } from "luna-base/dist/math/vec3";
import App from "./app";

let frame = 0.0;
let renderer: GLRenderer | null = null;
let root: Node | null = null;

const rotateImageApp: App = {
  start() {
    const imageResult = createPngImage(
      "./scripts/luna-base/tests/assets/waterfall-512x512.png"
    );
    assertIsNull(imageResult[0]);
    const image = imageResult[1];

    renderer = createGLRenderer();

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
    root = createNode();
    root.addSubMesh(subMesh);
  },
  update() {
    assertIsNotNull(renderer);
    assertIsNotNull(root);

    const rotation = frame * 0.02;
    quat.rotateZ(root.transform.rotation, quat.create(), rotation);
    const scale = 0.25 * math.sin(rotation) + 0.75;
    vec3.set(root.transform.scale, scale, scale, scale);

    root.update(mat4.create());
    renderer.render(root);
    frame += 1;

    collectgarbage("collect");
  },
  leave() {
    frame = 0.0;
    renderer = null;
    root = null;
  },
};

export default rotateImageApp;
