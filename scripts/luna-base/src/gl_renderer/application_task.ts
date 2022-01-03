import * as _gl from "gl";
import * as glfw from "glfw";
import * as imgui from "imgui";
import { isEmscripten } from "utils";
import { mat4 } from "../math/mat4";

import { allocTableName, getMetatableName } from "../tables";
import { createGLRendererTask } from "./gl_renderer_task";
import { initCommandState } from "./node";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskPrototype,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_APPLICATION_TASK");

interface ApplicationTaskField extends NodeTaskField {
  id: NodeTaskId;
  initialized: boolean;
}

interface ApplicationTaskPrototype extends NodeTaskPrototype<ApplicationTask> {}

export type ApplicationTask = ApplicationTaskPrototype & ApplicationTaskField;

const prototype: ApplicationTaskPrototype = {
  run: function (command, state) {
    const { name, node } = command;

    switch (name) {
      case "update": {
        if (this.initialized) {
          return state;
        } else {
          this.initialized = true;

          math.randomseed(math.floor(os.clock() * 1e11));

          const width = 1024;
          const height = 768;

          let state = initCommandState(null);

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

          glfw.start({
            width,
            height,
            start: () => {
              node.addTask(createGLRendererTask());

              _gl.viewport(0, 0, width, height);
              _gl.clearColor(1.0, 0.0, 1.0, 1.0);

              imgui.createContext();
              imgui.styleColorsDark();
              imgui.implGlfw_InitForOpenGL(true);
              imgui.implOpenGL3_Init();
            },
            update: () => {
              glfw.pollEvents();
              state = node.setup(state);
              state = node.update(state);
              state = node.transform(state, mat4.create());
              state = node.render(state);
              collectgarbage("collect");
            },
          });

          return state;
        }
      }
      default: {
        return state;
      }
    }
  },
};

export function createApplicationTask(this: void): ApplicationTask {
  const field: Omit<ApplicationTaskField, "id" | "enabled"> = {
    initialized: false,
  };
  return createTask(TABLE_NAME, field, prototype);
}

export function isApplicationTask(
  this: void,
  x: unknown
): x is ApplicationTask {
  return getMetatableName(x) === TABLE_NAME;
}
