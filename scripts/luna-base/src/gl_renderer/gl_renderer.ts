import * as _gl from "gl";
import { NULL } from "native_buffer";
import { createGLGeometryBuffer } from "../gl/gl_geometry_buffer";
import { createGLProgram, GLProgram } from "../gl/gl_program";
import { createGLTexture, GLTexture } from "../gl/gl_texture";
import { createGLVertexArray, GLVertexArray } from "../gl/gl_vertex_array";
import { assertIsNotNull } from "../type_utils";
import { CommandState, Node } from "./node";
import { isSubMeshTask } from "./sub_mesh_task";

interface GLRendererFields {
  programs: Record<string, GLProgram | undefined>;
  textures: Record<string, GLTexture | undefined>;
  vaos: Record<string, GLVertexArray | undefined>;
}

interface GLRendererPrototype {
  render: (this: GLRenderer, state: CommandState, node: Node) => void;
  registerProgram: (this: GLRenderer, name: string, program: GLProgram) => void;
  registerProgramFromSource: (
    this: GLRenderer,
    name: string,
    vs: string,
    fs: string
  ) => void;
}

export type GLRenderer = GLRendererPrototype & GLRendererFields;

const prototype: GLRendererPrototype = {
  render: function (state, node) {
    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

    const nodes = node.flat();

    for (const node of nodes) {
      node.tasks.forEach((task) => {
        if (!isSubMeshTask(task)) {
          return;
        }

        const subMesh = task.subMesh;
        const program = this.programs[subMesh.material.program.name];
        assertIsNotNull(program);

        if (this.vaos[subMesh.geometry.id] == null) {
          this.vaos[subMesh.geometry.id] = createGLVertexArray(
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

        const vao = this.vaos[subMesh.geometry.id];
        assertIsNotNull(vao);

        if (subMesh.material.texture != null) {
          if (this.textures[subMesh.material.texture.id] == null) {
            const texture = createGLTexture(subMesh.material.texture.image);
            assertIsNotNull(texture);
            this.textures[subMesh.material.texture.id] = texture;
          }
        }

        const texture =
          subMesh.material.texture != null
            ? this.textures[subMesh.material.texture.id]
            : null;

        program.use();

        const numComponents = vao.getNumComponents();
        const indicesType = vao.getIndicesType();
        assertIsNotNull(numComponents);
        assertIsNotNull(indicesType);
        vao.bind();

        const uWorld = program.uniforms.find((x) => x.name === "uWorld");
        if (uWorld != null) {
          const world = state.worlds[node.id];
          assertIsNotNull(world);
          _gl.uniformMatrix4fv(uWorld.location, 1, false, world.buffer);
        }

        const uTex = program.uniforms.find((x) => x.name === "uTex");
        if (uTex?.texUnit != null && texture?.tex != null) {
          const unit = uTex.texUnit;
          _gl.uniform1i(uTex.location, unit);
          _gl.activeTexture(_gl.TEXTURE0 + unit);
          _gl.bindTexture(texture.target, texture.tex);
        }

        _gl.drawElements(
          vao.getGeometryMode(),
          numComponents,
          indicesType,
          NULL
        );
      });
    }
  },
  registerProgram: function (name, program) {
    if (name in this.programs) {
      error(`already registered: ${name}`);
    }

    this.programs[name] = program;
  },
  registerProgramFromSource: function (name, vs, fs) {
    const programResult = createGLProgram(vs, fs);
    if (programResult[0] != null) {
      const { fsError, linkError, vsError } = programResult[0];
      error(
        `vsError: ${vsError}\nfsError: ${fsError}\nlinkError: ${linkError}`
      );
    } else {
      const program = programResult[1];
      this.registerProgram(name, program);
    }
  },
};

const metatable = {
  __index: prototype,
  __name: "LUA_TYPE_GL_RENDERER",
  __gc: function (this: GLRenderer) {},
};

function registerBasicProgram(this: void, renderer: GLRenderer) {
  renderer.registerProgramFromSource(
    "BASIC",
    `#version 300 es
in vec3 aPosition;
in vec2 aUv;
in vec4 aColor;

out vec4 vColor;
out vec2 vUv;

uniform mat4 uWorld;

void main() {
  vColor = aColor;
  vUv = aUv;
  gl_Position = uWorld * vec4(aPosition, 1.0);
}
`,
    `#version 300 es
precision highp float;

uniform sampler2D uTex;
 
in vec4 vColor;
in vec2 vUv;

out vec4 outColor;
 
void main() {
  outColor = texture(uTex, vUv) * vColor;
}
`
  );
}

export function createGLRenderer(this: void) {
  const fields: GLRendererFields = {
    vaos: {},
    programs: {},
    textures: {},
  };
  const o = setmetatable(fields, metatable) as GLRenderer;

  registerBasicProgram(o);

  return o;
}
