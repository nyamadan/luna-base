import * as _gl from "gl";
import "luna-base";
import { createGLProgram, isGLProgram } from "../src/gl/gl_program";
import { inspect } from "../src/lib/inspect/inspect";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_Program", {
  setUp: function (this: void) {},
  tearDown: function (this: void) {},

  test_compileShader: function (this: void) {
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
    lu.assertIsNumber(program.program);
    lu.assertEquals(program.attributes.length, 2);

    const aPosition = program.attributes.find((x) => x.name === "aPosition");
    lu.assertEquals(aPosition?.type, _gl.FLOAT_VEC3);

    const aColor = program.attributes.find((x) => x.name === "aColor");
    lu.assertEquals(aColor?.type, _gl.FLOAT_VEC4);

    const uColor = program.uniforms.find((x) => x.name === "uColor");
    lu.assertEquals(uColor?.type, _gl.FLOAT_VEC3);
  },
});
