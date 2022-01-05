import * as _gl from "gl";
import { NULL } from "native_buffer";
import { createGLGeometryBuffer } from "../gl/gl_geometry_buffer";
import { createGLProgram, GLProgram, isGLProgram } from "../gl/gl_program";
import { createGLTexture, GLTexture } from "../gl/gl_texture";
import { createGLVertexArray, GLVertexArray } from "../gl/gl_vertex_array";
import { inspect } from "../lib/inspect/inspect";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { safeUnreachable } from "../unreachable";
import { CommandState, NodeType } from "./node";
import { ShaderProgramId } from "./shader_program";
import { isSubMeshTask, SubMeshTaskType } from "./sub_mesh_task";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_RENDERER");

interface GLRendererFields {
  programs: Record<ShaderProgramId, GLProgram | undefined>;
  textures: Record<string, GLTexture | undefined>;
  vaos: Record<string, GLVertexArray | undefined>;
}

interface GLRendererPrototype {
  render: (this: GLRenderer, state: CommandState, node: NodeType) => void;
}

export type GLRenderer = GLRendererPrototype & GLRendererFields;

function renderSubMesh(
  this: void,
  renderer: GLRenderer,
  state: CommandState,
  node: NodeType,
  task: SubMeshTaskType
) {
  const subMesh = task.subMesh;

  assertIsNotNull(subMesh);

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

  if (renderer.vaos[subMesh.geometry.guid] == null) {
    renderer.vaos[subMesh.geometry.guid] = createGLVertexArray(
      program,
      createGLGeometryBuffer(
        {
          aPosition: subMesh.geometry.positions ?? [],
          aUv: subMesh.geometry.uv0s ?? [],
          aColor: subMesh.geometry.colors ?? [],
          indices: subMesh.geometry.indices ?? [],
        },
        { usage: _gl.STATIC_DRAW }
      )
    );
  }

  const vao = renderer.vaos[subMesh.geometry.guid];
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
      default: {
        safeUnreachable(value.type);
      }
    }
  }

  program.use();

  const uWorld = program.getWorld();
  if (uWorld != null) {
    const world = state.worlds[node.guid];
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
      default: {
        return safeUnreachable(value.type);
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

    const nodes: NodeType[] = [];
    node.traverse(function (node) {
      if (!node.enabled) {
        return false;
      }

      nodes.push(node);

      return true;
    });

    for (const node of nodes) {
      node.tasks.forEach((task) => {
        if (isSubMeshTask(task)) {
          renderSubMesh(this, state, node, task);
          return;
        }
      });
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
