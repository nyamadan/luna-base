import * as _gl from "gl";
import { new_buffer } from "native_buffer";
import { F32Array } from "../buffers/f32array";
import { NativeArray } from "../buffers/native_array";
import { U16Array } from "../buffers/u16array";
import { U8Array } from "../buffers/u8array";
import { allocTableName, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";

const TABLE_NAME = allocTableName("LUA_USERDATA_GL_BUFFER");

interface GLBufferFields {
  buffer: number | null;
  size: 1 | 2 | 3 | 4;
  numComponents: number;
  type:
    | typeof _gl.BYTE
    | typeof _gl.FIXED
    | typeof _gl.FLOAT
    | typeof _gl.HALF_FLOAT
    | typeof _gl.INT
    | typeof _gl.INT_2_10_10_10_REV
    | typeof _gl.SHORT
    | typeof _gl.UNSIGNED_BYTE
    | typeof _gl.UNSIGNED_INT
    | typeof _gl.UNSIGNED_INT_2_10_10_10_REV
    | typeof _gl.UNSIGNED_SHORT;
  normalized: boolean;
  stride: number;
  target: typeof _gl.ARRAY_BUFFER | typeof _gl.ELEMENT_ARRAY_BUFFER;
  usage: typeof _gl.DYNAMIC_DRAW | typeof _gl.STATIC_DRAW;
}

interface GLBufferMethods {
  bind: (this: GLBuffer) => void;
  unbind: (this: GLBuffer) => void;
  apply: (this: GLBuffer, array: NativeArray) => void;
  free: (this: GLBuffer) => void;
}

export interface GLBuffer extends GLBufferFields, GLBufferMethods {}

const glBufferMethods: GLBufferMethods = {
  bind: function () {
    assertIsNotNull(this.buffer);
    _gl.bindBuffer(this.target, this.buffer);
  },
  unbind: function () {
    assertIsNotNull(this.buffer);
    _gl.bindBuffer(this.target, 0);
  },
  apply: function (array) {
    assertIsNotNull(this.buffer);
    _gl.bufferData(this.target, array.buffer.length, array.buffer, this.usage);
    // _gl.bufferSubData(this.target, NULL, array.buffer.length, array.buffer);
  },
  free: function () {
    if (this.buffer != null) {
      const p = new_buffer(4);
      p.set_int32(0, this.buffer);
      _gl.deleteBuffers(1, p);
      this.buffer = null;
    }
  },
};

const glArrayBufferMetatable = {
  __index: glBufferMethods,
  __name: "LUA_TYPE_GL_BUFFER",
  __gc: function (this: GLBuffer) {
    this.free();
  },
};

function createGLArrayBuffer<T extends NativeArray>(
  this: void,
  array: T,
  options: Partial<Omit<GLBufferFields, "array" | "buffer">>
): GLBuffer {
  const init: GLBufferFields = {
    buffer: null,
    target: _gl.ARRAY_BUFFER,
    normalized: false,
    size: 4,
    numComponents: 0,
    stride: 0,
    type: _gl.FLOAT,
    usage: _gl.STATIC_DRAW,
    ...options,
  };
  const o = setmetatable(init, glArrayBufferMetatable as any) as GLBuffer;

  const pBuffer = new_buffer(4);
  _gl.genBuffers(1, pBuffer);
  const buffer = pBuffer.get_int32(0);
  o.buffer = buffer;

  assertIsNotNull(o.buffer);
  _gl.bindBuffer(o.target, o.buffer);
  _gl.bufferData(o.target, array.buffer.length, array.buffer, o.usage);
  _gl.bindBuffer(o.target, 0);
  return o;
}

export function isGlBuffer(this: void, x: unknown): x is GLBuffer {
  return getMetatableName(x) === TABLE_NAME;
}

export function createGLF32ArrayBuffer(
  this: void,
  array: F32Array,
  option: Parameters<typeof createGLArrayBuffer>[1] = {}
) {
  return createGLArrayBuffer(array, option);
}

export function createGLU16ArrayBuffer(
  this: void,
  array: U16Array,
  option: Parameters<typeof createGLArrayBuffer>[1] = {}
) {
  return createGLArrayBuffer(array, option);
}

export function createGLU8ArrayBuffer(
  this: void,
  array: U8Array,
  option: Parameters<typeof createGLArrayBuffer>[1] = {}
) {
  return createGLArrayBuffer(array, option);
}
