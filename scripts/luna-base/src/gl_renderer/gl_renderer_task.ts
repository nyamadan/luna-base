import * as imgui from "imgui";

import { allocTableName, createTable, getMetatableName } from "../tables";
import { uuid } from "../uuid";
import { createGLRenderer, GLRenderer } from "./gl_renderer";
import { NodeTaskField, NodeTaskId, NodeTaskPrototype } from "./node";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_RENDERER_TASK");

interface GLRendererTaskField extends NodeTaskField {
  id: NodeTaskId;
  renderer: GLRenderer;
}

interface GLRendererTaskPrototype extends NodeTaskPrototype<GLRendererTask> {}

export type GLRendererTask = GLRendererTaskPrototype & GLRendererTaskField;

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

export function createGLRendererTask(this: void) {
  const fields: GLRendererTaskField = {
    id: uuid.v4() as NodeTaskId,
    enabled: true,
    renderer: createGLRenderer(),
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isGLRendererTask(this: void, x: unknown): x is GLRendererTask {
  return getMetatableName(x) === TABLE_NAME;
}
