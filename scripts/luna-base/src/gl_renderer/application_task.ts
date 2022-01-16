import * as _gl from "gl";
import * as glfw from "glfw";
import * as imgui from "imgui";
import { isEmscripten } from "luna-base-utils";
import mat4 from "../math/mat4";
import { allocTableName, getMetatableName } from "../tables";
import { createGLRendererTask } from "./gl_renderer_task";
import {
  createNodeTaskPrototype,
  createTask,
  initCommandState,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_APPLICATION_TASK");

interface ApplicationTaskField extends NodeTaskField {
  readonly width: number;
  readonly height: number;

  initialized: boolean;
}

interface ApplicationTaskPrototype extends NodeTaskPrototype<ApplicationTask> {}

export type ApplicationTask = ApplicationTaskField & ApplicationTaskPrototype;

const prototype: ApplicationTaskPrototype =
  createNodeTaskPrototype<ApplicationTask>({
    run(command, state) {
      const { name } = command;

      switch (name) {
        case "setup": {
          if (this.initialized) {
            return state;
          } else {
            this.initialized = true;

            math.randomseed(math.floor(os.clock() * 1e11));

            this.tasks.push(createGLRendererTask());

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
              width: this.width,
              height: this.height,
              start: () => {
                _gl.viewport(0, 0, this.width, this.height);
                _gl.clearColor(1.0, 0.0, 1.0, 1.0);

                imgui.createContext();
                imgui.styleColorsDark();
                imgui.implGlfw_InitForOpenGL(true);
                imgui.implOpenGL3_Init();
              },
              update: () => {
                glfw.pollEvents();
                this.updateRefs();
                state = this.setup(state);
                state = this.update(state);
                state = this.updateWorld(state, mat4.create());
                state = this.render(state);
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
  });

export function createApplicationTask(
  this: void,
  params: NodeTaskProps<ApplicationTaskField, never, "height" | "width">
): ApplicationTask {
  const fields: Omit<ApplicationTaskField, keyof NodeTaskField> = {
    initialized: false,
    width: params.width ?? 1024,
    height: params.height ?? 768,
  };

  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...fields,
    },
    prototype
  ) as ApplicationTask;
}

export function isApplicationTask(
  this: void,
  x: unknown
): x is ApplicationTask {
  return getMetatableName(x) === TABLE_NAME;
}
