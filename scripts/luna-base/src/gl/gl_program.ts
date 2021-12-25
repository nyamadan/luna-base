import * as _gl from "gl";
import { new_buffer, SIZE_OF_POINTER } from "native_buffer";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_PROGRAM");

function loadShader(
  this: void,
  shaderSource: string,
  shaderType: typeof _gl.VERTEX_SHADER | typeof _gl.FRAGMENT_SHADER
) {
  const shader = _gl.createShader(shaderType);

  const shaderSourceBuffer = new_buffer(shaderSource.length);
  shaderSourceBuffer.set_string(shaderSource);

  const shaderSourcesBuffer = new_buffer(SIZE_OF_POINTER, {
    buffer_type: "unsafe_pointer",
  });
  shaderSourcesBuffer.set_pointer(0, shaderSourceBuffer, 0);

  const lengthBuffer = new_buffer(4);
  lengthBuffer.set_int32(0, shaderSource.length);
  _gl.shaderSource(shader, 1, shaderSourcesBuffer, lengthBuffer);

  _gl.compileShader(shader);

  const paramsBuffer = new_buffer(4);
  _gl.getShaderiv(shader, _gl.COMPILE_STATUS, paramsBuffer);
  const compiled = paramsBuffer.get_int32(0) !== 0;
  if (!compiled) {
    const infoBufferMaxLength = 512;
    const infoBuffer = new_buffer(infoBufferMaxLength);
    const infoLengthBuffer = new_buffer(4);
    _gl.getShaderInfoLog(
      shader,
      infoBufferMaxLength,
      infoLengthBuffer,
      infoBuffer
    );
    const lastError = infoBuffer.get_string();
    _gl.deleteShader(shader);
    return { error: lastError, shader: null };
  }

  return { error: null, shader };
}
interface ProgramAttributeOrUniform {
  type: number;
  name: string;
  location: number;
  size: number;
}

interface ProgramUniformNotTexture extends ProgramAttributeOrUniform {
  texUnit: null;
}

interface ProgramUniformTexture extends ProgramAttributeOrUniform {
  texUnit: number;
}

type ProgramUniform = ProgramUniformTexture | ProgramUniformNotTexture;

interface ProgramFields {
  program: number | null;
  attributes: Array<ProgramAttributeOrUniform>;
  uniforms: Array<ProgramUniform>;
}

interface ProgramMethods {
  use: (this: GLProgram) => void;
  free: (this: GLProgram) => void;
}

export type GLProgram = ProgramMethods & ProgramFields;

const programMethods: ProgramMethods = {
  use: function () {
    assertIsNotNull(this.program, "program must not be nil");
    _gl.useProgram(this.program);
  },
  free: function () {
    if (this.program != null) {
      _gl.deleteProgram(this.program);
      this.program = null;
    }
  },
};

function loadAttributes(this: void, program: number) {
  const pCount = new_buffer(4);
  _gl.getProgramiv(program, _gl.ACTIVE_ATTRIBUTES, pCount);

  const count = pCount.get_int32(0);
  const attributes: ProgramAttributeOrUniform[] = [];
  const bufSize = 128;
  const pName = new_buffer(bufSize + 1);
  const pLength = new_buffer(4);
  const pSize = new_buffer(4);
  const pType = new_buffer(4);
  for (let i = 0; i < count; i++) {
    _gl.getActiveAttrib(program, i, bufSize, pLength, pSize, pType, pName);
    const name = pName.get_string();
    const location = _gl.getAttribLocation(program, name as any); // bug: need to fix type.
    assert(pLength.get_int32(0) <= bufSize);
    attributes.push({
      location,
      name,
      type: pType.get_int32(0),
      size: pSize.get_int32(0),
    });
  }
  return attributes;
}

function loadUniforms(program: number) {
  const pCount = new_buffer(4);
  _gl.getProgramiv(program, _gl.ACTIVE_UNIFORMS, pCount);

  const count = pCount.get_int32(0);
  const uniforms: ProgramUniform[] = [];
  const bufSize = 128;
  const pName = new_buffer(bufSize + 1);
  const pLength = new_buffer(4);
  const pSize = new_buffer(4);
  const pType = new_buffer(4);

  let texUnitCounter = 0;
  for (let i = 0; i < count; i++) {
    _gl.getActiveUniform(program, i, bufSize, pLength, pSize, pType, pName);
    assert(pLength.get_int32(0) <= bufSize);

    const name = pName.get_string();
    const location = _gl.getUniformLocation(program, name as any); // bug: need to fix type.

    const type = pType.get_int32(0);
    let texUnit: number | null = null;
    if (
      type === _gl.SAMPLER_2D ||
      type === _gl.SAMPLER_2D_ARRAY ||
      type === _gl.SAMPLER_3D ||
      type === _gl.SAMPLER_CUBE
    ) {
      texUnit = texUnitCounter + 1;
      texUnitCounter += 1;
    }

    uniforms.push({
      type,
      texUnit,
      location,
      name,
      size: pSize.get_int32(0),
    });
  }
  return uniforms;
}

interface GLProgramError {
  linkError: string | null;
  vsError: string | null;
  fsError: string | null;
}

export function createGLProgram(
  this: void,
  vsSource: string,
  fsSource: string
): GLProgram | GLProgramError {
  const fields: ProgramFields = {
    program: null,
    attributes: [],
    uniforms: [],
  };

  const o = createTable(
    TABLE_NAME,
    fields,
    programMethods,
    function (this: GLProgram) {
      this.free();
    }
  );

  const vs = loadShader(vsSource, _gl.VERTEX_SHADER);
  const fs = loadShader(fsSource, _gl.FRAGMENT_SHADER);

  if (vs.shader == null || fs.shader == null) {
    if (vs.shader != null) {
      _gl.deleteShader(vs.shader);
    }
    if (fs.shader != null) {
      _gl.deleteShader(fs.shader);
    }
    return {
      vsError: vs.error,
      fsError: fs.error,
      linkError: null,
    };
  }

  const program = _gl.createProgram();

  _gl.attachShader(program, vs.shader);
  _gl.attachShader(program, fs.shader);
  _gl.linkProgram(program);
  _gl.deleteShader(vs.shader);
  _gl.deleteShader(fs.shader);

  const paramsBuffer = new_buffer(4);
  _gl.getProgramiv(program, _gl.LINK_STATUS, paramsBuffer);
  const linked = paramsBuffer.get_int32(0) !== 0;
  if (!linked) {
    const infoBufferMaxLength = 512;
    const infoBuffer = new_buffer(infoBufferMaxLength);
    const infoLengthBuffer = new_buffer(4);
    _gl.getProgramInfoLog(
      program,
      infoBufferMaxLength,
      infoLengthBuffer,
      infoBuffer
    );
    const linkError = infoBuffer.get_string();
    _gl.deleteProgram(program);
    return {
      linkError,
      vsError: vs.error,
      fsError: fs.error,
    };
  } else {
    o.attributes = loadAttributes(program);
    o.uniforms = loadUniforms(program);
    o.program = program;
  }

  return o;
}

export function isGLProgram(this: void, x: unknown): x is GLProgram {
  return getMetatableName(x) === TABLE_NAME;
}
