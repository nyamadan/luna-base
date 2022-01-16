import * as _gl from "gl";
import { NULL } from "native_buffer";
import { createGLGeometryBuffer } from "../gl/gl_geometry_buffer";
import { createGLProgram, GLProgram, isGLProgram } from "../gl/gl_program";
import { createGLTexture, GLTexture } from "../gl/gl_texture";
import { createGLVertexArray, GLVertexArray } from "../gl/gl_vertex_array";
import { inspect } from "../lib/inspect/inspect";
import { logger } from "../logger";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { safeUnreachable } from "../unreachable";
import { CommandState, NodeTaskType } from "./node_task";
import { ShaderProgramId } from "./shader_program";
import { isSubMeshTask, SubMeshTaskType } from "./sub_mesh_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_RENDERER");

interface GLRendererFields {
  programs: Record<ShaderProgramId, GLProgram | undefined>;
  textures: Record<string, GLTexture | undefined>;
  vaos: Record<string, GLVertexArray | undefined>;
}

interface GLRendererPrototype {
  render: (this: GLRenderer, state: CommandState, task: NodeTaskType) => void;
}

export type GLRenderer = GLRendererFields & GLRendererPrototype;

function renderSubMesh(
  this: void,
  renderer: GLRenderer,
  state: CommandState,
  task: SubMeshTaskType
) {
  const subMesh = task.subMesh;

  if (subMesh == null) {
    logger.info(`subMesh was not rendered: ${task.name}(${task.guid})`);
    return;
  }

  if (renderer.programs[subMesh.material.shaderProgram.guid] == null) {
    const program = createGLProgram(
      subMesh.material.shaderProgram.vertexShader.source,
      subMesh.material.shaderProgram.fragmentShader.source
    );
    if (isGLProgram(program)) {
      renderer.programs[subMesh.material.shaderProgram.guid] = program;
    } else {
      error(inspect(program));
    }
  }

  const program = renderer.programs[subMesh.material.shaderProgram.guid];

  assertIsNotNull(program);

  const geometry = state.geometries[subMesh.geometryTaskGuid];

  assertIsNotNull(geometry);

  if (renderer.vaos[geometry.guid] == null) {
    renderer.vaos[geometry.guid] = createGLVertexArray(
      program,
      createGLGeometryBuffer(
        {
          aPosition: geometry.positions ?? [],
          aUv: geometry.uv0s ?? [],
          aColor: geometry.colors ?? [],
          indices: geometry.indices ?? [],
        },
        { usage: _gl.STATIC_DRAW }
      )
    );
  }

  const vao = renderer.vaos[geometry.guid];
  assertIsNotNull(vao);

  // Setup Uniform Values
  for (const value of Object.values(subMesh.material.uniformValues)) {
    switch (value.type) {
      case "Texture": {
        if (renderer.textures[value.texture.guid] == null) {
          const image = state.images[value.texture.imageTaskGuid];
          assertIsNotNull(image);
          const texture = createGLTexture(image);
          assertIsNotNull(texture);
          renderer.textures[value.texture.guid] = texture;
        }
        break;
      }
      case "Vec4": {
        // Need to load vec4?
        break;
      }
      default: {
        safeUnreachable(value);
      }
    }
  }

  program.use();

  const uWorld = program.getWorld();
  if (uWorld != null) {
    const world = state.worlds[task.guid];
    assertIsNotNull(world);
    _gl.uniformMatrix4fv(uWorld.location, 1, false, world.buffer);
  }

  for (const [name, value] of Object.entries(subMesh.material.uniformValues)) {
    switch (value.type) {
      case "Texture": {
        const texture =
          value.texture != null ? renderer.textures[value.texture.guid] : null;
        const uTex = program.uniforms.find((x) => x.name === name);
        if (uTex?.texUnit != null && texture?.tex != null) {
          const unit = uTex.texUnit;
          _gl.uniform1i(uTex.location, unit);
          _gl.activeTexture(_gl.TEXTURE0 + unit);
          _gl.bindTexture(texture.target, texture.tex);
        }
        break;
      }
      case "Vec4": {
        const uVec4 = program.uniforms.find((x) => x.name === name);
        if (uVec4 != null) {
          _gl.uniform4fv(uVec4.location, 4, value.value.buffer);
        }
        break;
      }
      default: {
        return safeUnreachable(value);
      }
    }
  }

  const numComponents = vao.getNumComponents();
  const indicesType = vao.getIndicesType();
  const mode = vao.getGeometryMode();
  assertIsNotNull(numComponents);
  assertIsNotNull(indicesType);
  vao.bind();
  _gl.drawElements(mode, numComponents, indicesType, NULL);
  vao.unbind();
}

const prototype: GLRendererPrototype = {
  render: function (state, node) {
    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

    const tasks: NodeTaskType[] = [];
    node.traverse(function (task) {
      if (!task.enabled) {
        return false;
      }

      tasks.push(task);

      return true;
    });

    for (const task of tasks) {
      if (!isSubMeshTask(task)) {
        continue;
      }

      renderSubMesh(this, state, task);
    }
  },
};

export function createGLRenderer(this: void) {
  const fields: GLRendererFields = {
    vaos: {},
    programs: {},
    textures: {},
  };

  return createTable(TABLE_NAME, fields, prototype);
}

export function isGLRenderer(this: void, x: unknown): x is GLRenderer {
  return getMetatableName(x) === TABLE_NAME;
}
