import "luna-base";
import * as _gl from "gl";
import * as glfw from "glfw";
import * as imgui from "imgui";
import { isEmscripten } from "utils";
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
import { new_buffer, SIZE_OF_BOOL } from "native_buffer";

math.randomseed(math.floor(os.clock() * 1e11));

const width = 1024;
const height = 768;

glfw.init();

if (isEmscripten()) {
  glfw.windowHint(glfw.CLIENT_API, glfw.OPENGL_ES_API);
  glfw.windowHint(glfw.CONTEXT_VERSION_MAJOR, 3);
  glfw.windowHint(glfw.CONTEXT_VERSION_MINOR, 0);
} else {
  glfw.windowHint(glfw.CONTEXT_VERSION_MAJOR, 3);
  glfw.windowHint(glfw.CONTEXT_VERSION_MINOR, 2);
  glfw.windowHint(glfw.OPENGL_FORWARD_COMPAT, glfw.TRUE);
  glfw.windowHint(glfw.OPENGL_PROFILE, glfw.OPENGL_CORE_PROFILE);
}

glfw.windowHint(glfw.OPENGL_DEBUG_CONTEXT, glfw.TRUE);
glfw.windowHint(glfw.RESIZABLE, glfw.FALSE);

let frame = 0.0;
let renderer: GLRenderer | null = null;
let root: Node | null = null;

const pOpen = new_buffer(SIZE_OF_BOOL);
pOpen.set_bool(0, true);

glfw.start({
  width,
  height,
  start: function () {
    imgui.createContext();
    imgui.styleColorsDark();
    imgui.implGlfw_InitForOpenGL(true);
    imgui.implOpenGL3_Init();

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
    _gl.viewport(0, 0, width, height);
    _gl.clearColor(1.0, 0.0, 1.0, 1.0);
  },
  update: function () {
    glfw.pollEvents();

    imgui.implOpenGL3_NewFrame();
    imgui.implGlfw_NewFrame();
    imgui.newFrame();

    if (pOpen.get_bool(0)) {
      imgui.showDemoWindow(pOpen);
    }

    if (imgui.begin("Hello World")) {
      imgui.text("Button");
      if (imgui.button("PUSH ME")) {
        print("PUSHED!");
      }
    }
    imgui.end();

    imgui.render();

    assertIsNotNull(renderer);
    assertIsNotNull(root);

    const rotation = frame * 0.02;
    quat.rotateZ(root.transform.rotation, quat.create(), rotation);
    const scale = 0.25 * math.sin(rotation) + 0.75;
    vec3.set(root.transform.scale, scale, scale, scale);

    root.update(mat4.create());
    renderer.render(root);

    imgui.implOpenGL3_RenderDrawData();
    frame += 1;

    collectgarbage("collect");
  },
});
