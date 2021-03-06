import * as imgui from "imgui";

import { allocTableName, getMetatableName } from "../../tables";
import { createGLRenderer, GLRenderer } from "../gl_renderer";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_RENDERER_TASK");

interface GLRendererTaskField extends NodeTaskField {
  renderer: GLRenderer;
}

interface GLRendererTaskPrototype
  extends NodeTaskPrototype<GLRendererTaskType> {}

export type GLRendererTaskType = GLRendererTaskField & GLRendererTaskPrototype;

const prototype: GLRendererTaskPrototype = createNodeTaskPrototype({
  run(command, state) {
    const { name, node } = command;
    switch (name) {
      case "prerender": {
        imgui.implOpenGL3_NewFrame();
        if (imgui.implSDL2_NewFrame != null) {
          imgui.implSDL2_NewFrame();
        } else if (imgui.implGlfw_NewFrame != null) {
          imgui.implGlfw_NewFrame();
        }
        imgui.newFrame();
        return state;
      }
      case "render": {
        imgui.render();
        this.renderer.render(state, node);
        imgui.implOpenGL3_RenderDrawData();
        collectgarbage("collect");
        return state;
      }
      default: {
        return state;
      }
    }
  },
});

export function createGLRendererTask(
  this: void,
  params: NodeTaskProps<GLRendererTaskField, never, never> = {}
): GLRendererTaskType {
  const field: Omit<GLRendererTaskField, keyof NodeTaskField> = {
    renderer: createGLRenderer(),
  };
  return createTask(
    TABLE_NAME,
    { ...pickOptionalField(params), ...field },
    prototype
  );
}

export function isGLRendererTask(
  this: void,
  x: unknown
): x is GLRendererTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function GLRendererTask(
  this: void,
  ...params: Parameters<typeof createGLRendererTask>
) {
  return createGLRendererTask(...params);
}
