import { createShader } from "./shader";
import { createShaderProgram } from "./shader_program";

export function createBasicShader(this: void) {
  const vertexShader = createShader(
    "VERTEX_SHADER",
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
`
  );

  const fragmentShader = createShader(
    "FRAGMENT_SHADER",
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

  const shaderProgram = createShaderProgram(vertexShader, fragmentShader);

  return shaderProgram;
}
