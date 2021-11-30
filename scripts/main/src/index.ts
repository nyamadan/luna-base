import "luna-base";
import * as _gl from "gl";
import * as glfw from "glfw";
import * as imgui from "imgui";
import { isEmscripten } from "utils";

import imguiApp from "./imgui_app";
import rotateImageApp from "./rotate_image_app";
import App from "./app";

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

const emptyApp: App = {
  start: function () {
    _gl.clearColor(1.0, 0.0, 1.0, 1.0);
  },
  update: function () {
    _gl.clear(_gl.DEPTH_BUFFER_BIT | _gl.COLOR_BUFFER_BIT);
  },
  leave: function () {},
};

let app: App = emptyApp;

glfw.start({
  width,
  height,
  start: function () {
    imgui.createContext();
    imgui.styleColorsDark();
    imgui.implGlfw_InitForOpenGL(true);
    imgui.implOpenGL3_Init();
    _gl.viewport(0, 0, width, height);
    app.start({ width, height });
  },
  update: function () {
    glfw.pollEvents();

    imgui.implOpenGL3_NewFrame();
    imgui.implGlfw_NewFrame();
    imgui.newFrame();

    if (imgui.begin("SelectApps")) {
      if (imgui.button("Empty")) {
        app.leave();
        app = emptyApp;
      }
      if (imgui.button("Imgui")) {
        app = imguiApp;
        app.start({ width, height });
      }
      if (imgui.button("RotateImage")) {
        app = rotateImageApp;
        app.start({ width, height });
      }
    }
    imgui.end();

    app.update();

    imgui.render();
    imgui.implOpenGL3_RenderDrawData();
  },
});
