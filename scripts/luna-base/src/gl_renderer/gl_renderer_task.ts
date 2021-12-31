import * as imgui from "imgui";

import { allocTableName, getMetatableName } from "../tables";
import { createGLRenderer, GLRenderer } from "./gl_renderer";
import {
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskPrototype,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_RENDERER_TASK");

interface GLRendererTaskField extends NodeTaskField {
  id: NodeTaskId;
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
        this.renderer.render(state, command.node);
        imgui.implOpenGL3_RenderDrawData();
        collectgarbage("collect");
        return state;
      }
      default: {
        return state;
      }
    }
  },
};

export function createGLRendererTask(this: void): GLRendererTaskType {
  return createTask(TABLE_NAME, { renderer: createGLRenderer() }, prototype);
}

export function isGLRendererTask(
  this: void,
  x: unknown
): x is GLRendererTaskType {
  return getMetatableName(x) === TABLE_NAME;
}
