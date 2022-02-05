import * as _gl from "gl";
import * as glfw from "glfw";
import * as imgui from "imgui";
import { isEmscripten } from "luna-base-utils";
import * as sdl from "sdl";
import mat4 from "../../math/mat4";
import { allocTableName, getMetatableName } from "../../tables";
import { InputEvent } from "./application_event";
import { createGLRendererTask } from "./gl_renderer_task";
import { createInputTask } from "./input_task";
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

interface ApplicationTaskPrototype
  extends NodeTaskPrototype<ApplicationTaskType> {}

export type ApplicationTaskType = ApplicationTaskField &
  ApplicationTaskPrototype;

const prototype: ApplicationTaskPrototype =
  createNodeTaskPrototype<ApplicationTaskType>({
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
            this.tasks.push(createInputTask());

            let state = initCommandState(null);

            if (sdl.init != null) {
              sdl.init(sdl.SDL_INIT_VIDEO | sdl.SDL_INIT_VIDEO);

              if (isEmscripten()) {
                sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MAJOR_VERSION, 3);
                sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MINOR_VERSION, 0);
                sdl.GL_Set_Attribute(
                  sdl.SDL_GL_CONTEXT_PROFILE_MASK,
                  sdl.SDL_GL_CONTEXT_PROFILE_ES
                );
              } else {
                sdl.GL_Set_Attribute(
                  sdl.SDL_GL_CONTEXT_PROFILE_MASK,
                  sdl.SDL_GL_CONTEXT_PROFILE_CORE
                );
                sdl.GL_Set_Attribute(
                  sdl.SDL_GL_CONTEXT_FLAGS,
                  sdl.SDL_GL_CONTEXT_FORWARD_COMPATIBLE_FLAG
                );
                sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MAJOR_VERSION, 3);
                sdl.GL_Set_Attribute(sdl.SDL_GL_CONTEXT_MINOR_VERSION, 2);
              }

              sdl.start({
                width: this.width,
                height: this.height,
                flags:
                  sdl.SDL_WINDOW_SHOWN |
                  sdl.SDL_WINDOW_OPENGL |
                  sdl.SDL_WINDOW_ALLOW_HIGHDPI,
                start: () => {
                  _gl.viewport(0, 0, this.width, this.height);
                  _gl.clearColor(1.0, 0.0, 1.0, 1.0);

                  imgui.createContext();
                  imgui.styleColorsDark();
                  imgui.implSDL2_InitForOpenGL(true);
                  imgui.implOpenGL3_Init();
                },
                update: () => {
                  const inputEvents: InputEvent[] = [];

                  for (
                    let [result, ev] = sdl.pollEvent();
                    result !== 0;
                    [result, ev] = sdl.pollEvent()
                  ) {
                    imgui.implSDL2_ProcessEvent();
                    if (
                      ev.type === sdl.SDL_WINDOWEVENT &&
                      ev.window.event === sdl.SDL_WINDOWEVENT_CLOSE
                    ) {
                      sdl.setShouldWindowClose(true);
                    }

                    switch (ev.type) {
                      case sdl.SDL_KEYDOWN: {
                        if (ev.key.repeat != 0) {
                          break;
                        }

                        inputEvents.push({
                          type: "KEY_DOWN",
                          code: ev.key.keysym.sym,
                        });
                        break;
                      }
                      case sdl.SDL_KEYUP: {
                        inputEvents.push({
                          type: "KEY_UP",
                          code: ev.key.keysym.sym,
                        });
                        break;
                      }
                      case sdl.SDL_MOUSEBUTTONDOWN: {
                        inputEvents.push({
                          type: "MOUSE_BUTTON_DOWN",
                          button: ev.button.button,
                        });
                        break;
                      }
                      case sdl.SDL_MOUSEBUTTONUP: {
                        inputEvents.push({
                          type: "MOUSE_BUTTON_UP",
                          button: ev.button.button,
                        });
                        break;
                      }
                      case sdl.SDL_MOUSEMOTION: {
                        inputEvents.push({
                          type: "MOUSE_MOVE",
                          posx: ev.motion.x,
                          posy: ev.motion.y,
                        });
                        break;
                      }
                    }
                  }

                  this.updateRefs();
                  state = this.setup(state);
                  state = this.input(state, inputEvents);
                  state = this.update(state);
                  state = this.updateWorld(state, mat4.create());
                  state = this.render(state);
                  collectgarbage("collect");
                },
              });
            } else if (glfw.init != null) {
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
                  const inputEvents: InputEvent[] = [];

                  glfw.pollEvents();
                  this.updateRefs();

                  for (const ev of glfw.getKeyEvents()) {
                    switch (ev.action) {
                      case glfw.PRESS: {
                        inputEvents.push({ type: "KEY_DOWN", code: ev.key });
                        break;
                      }
                      case glfw.RELEASE: {
                        inputEvents.push({ type: "KEY_UP", code: ev.key });
                        break;
                      }
                    }
                  }

                  for (const ev of glfw.getMouseEvents()) {
                    switch (ev.event) {
                      case "button": {
                        switch (ev.action) {
                          case glfw.PRESS: {
                            inputEvents.push({
                              type: "MOUSE_BUTTON_DOWN",
                              button: ev.button,
                            });
                            break;
                          }
                          case glfw.RELEASE: {
                            inputEvents.push({
                              type: "MOUSE_BUTTON_UP",
                              button: ev.button,
                            });
                            break;
                          }
                        }
                        break;
                      }
                      case "position": {
                        inputEvents.push({
                          type: "MOUSE_MOVE",
                          posx: ev.xpos,
                          posy: ev.ypos,
                        });
                        break;
                      }
                    }
                  }

                  glfw.clearMouseEvents();
                  glfw.clearKeyEvents();

                  state = this.setup(state);
                  state = this.input(state, inputEvents);
                  state = this.update(state);
                  state = this.updateWorld(state, mat4.create());
                  state = this.render(state);
                  collectgarbage("collect");
                },
              });
            }
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
): ApplicationTaskType {
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
  ) as ApplicationTaskType;
}

export function isApplicationTask(
  this: void,
  x: unknown
): x is ApplicationTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
