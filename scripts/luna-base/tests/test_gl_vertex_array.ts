import { createGLGeometryBuffer } from "../src/gl/gl_geometry_buffer";
import { createGLProgram, isGLProgram } from "../src/gl/gl_program";
import { createGLVertexArray } from "../src/gl/gl_vertex_array";
import { inspect } from "../src/lib/inspect/inspect";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_GLBuffer", {
  setUp: function (this: void) {},
  tearDown: function (this: void) {},

  test_vao: function (this: void) {
    const vs = `#version 300 es
    in vec3 aPosition;
    in vec4 aColor;

    uniform vec3 uColor;

    out vec4 vColor;

void main() {
    vColor = aColor * vec4(uColor, 1.0);
    gl_Position = vec4(aPosition, 1.0);
}
`;

    const fs = `#version 300 es
precision highp float;

in vec4 vColor;
 
out vec4 outColor;
 
void main() {
    outColor = vColor;
}
`;
    const program = createGLProgram(vs, fs);
    if (!isGLProgram(program)) {
      lu.fail(inspect(program));
    }

    const vao = createGLVertexArray(
      program,
      createGLGeometryBuffer({
        aPosition: [
          -1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0,
        ],
        aColor: [
          1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
          0.0, 1.0,
        ],
        indices: [0, 2, 1, 1, 2, 3],
      })
    );
    lu.assertNotNil(vao.vao);
    lu.assertNotNil(vao.geometry.buffers["aPosition"]);
    lu.assertNotNil(vao.geometry.buffers["aColor"]);
  },
});
