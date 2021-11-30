import "luna-base";
import * as _gl from "gl";
import * as imgui from "imgui";
import App from "./app";
import { assertIsNotNull } from "luna-base/dist/type_utils";
import { NativeBuffer, new_buffer, SIZE_OF_BOOL } from "native_buffer";

let pOpen: NativeBuffer | null = null;

const imguiApp: App = {
  start() {
    pOpen = new_buffer(SIZE_OF_BOOL);
    pOpen.set_bool(0, true);
    _gl.clearColor(1.0, 0.0, 1.0, 1.0);
  },

  update() {
    assertIsNotNull(pOpen);

    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

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

    collectgarbage("collect");
  },

  leave() {
    pOpen = null;
  },
};

export default imguiApp;
