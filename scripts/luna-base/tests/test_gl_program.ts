import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

import "luna-base";
import * as _gl from "gl";
import { createGLProgram } from "../src/gl/gl_program";

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
    const programResult = createGLProgram(vs, fs);
    const program = programResult[1]!;
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
