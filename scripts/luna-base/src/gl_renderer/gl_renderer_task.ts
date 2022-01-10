import * as imgui from "imgui";

import { allocTableName, getMetatableName } from "../tables";
import { createGLRenderer, GLRenderer } from "./gl_renderer";
import {
  createTask,
  NodeTaskField,
  NodeTaskProps,
  nodeTaskPrototype,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_RENDERER_TASK");

interface GLRendererTaskField extends NodeTaskField {
  renderer: GLRenderer;
}

interface GLRendererTaskPrototype
  extends NodeTaskPrototype<GLRendererTaskType> {}

export type GLRendererTaskType = GLRendererTaskPrototype & GLRendererTaskField;

const prototype: GLRendererTaskPrototype = {
  run: function (command, state) {
    const { name } = command;
    switch (name) {
      case "prerender": {
        imgui.implOpenGL3_NewFrame();
        imgui.implGlfw_NewFrame();
        imgui.newFrame();
        return state;
      }
      case "render": {
        imgui.render();
        this.renderer.render(state, command.task);
        imgui.implOpenGL3_RenderDrawData();
        collectgarbage("collect");
        return state;
      }
      default: {
        return state;
      }
    }
  },
  ...nodeTaskPrototype,
};

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
