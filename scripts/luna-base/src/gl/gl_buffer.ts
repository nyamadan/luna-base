import * as _gl from "gl";
import { new_buffer } from "native_buffer";
import { F32Array } from "../buffers/f32array";
import { NativeArray } from "../buffers/native_array";
import { assertIsNotNull } from "../type_utils";
import { U16Array } from "../buffers/u16array";
import { U8Array } from "../buffers/u8array";
import { allocTableName, getMetatableName } from "../tables";

const TABLE_NAME = allocTableName("LUA_USERDATA_GL_BUFFER");

interface GLBufferFields<T extends NativeArray> {
  array: T | null;
  buffer: number | null;
  size: 1 | 2 | 3 | 4;
  numComponents: number;
  type:
    | typeof _gl.BYTE
    | typeof _gl.UNSIGNED_BYTE
    | typeof _gl.SHORT
    | typeof _gl.UNSIGNED_SHORT
    | typeof _gl.INT
    | typeof _gl.UNSIGNED_INT
    | typeof _gl.HALF_FLOAT
    | typeof _gl.FLOAT
    | typeof _gl.FIXED
    | typeof _gl.INT_2_10_10_10_REV
    | typeof _gl.UNSIGNED_INT_2_10_10_10_REV;
  normalized: boolean;
  stride: number;
  target: typeof _gl.ARRAY_BUFFER | typeof _gl.ELEMENT_ARRAY_BUFFER;
  usage: typeof _gl.STATIC_DRAW | typeof _gl.DYNAMIC_DRAW;
}

interface GLBufferMethods {
  apply: (this: GLBuffer) => void;
  free: (this: GLBuffer) => void;
}

export type GLBuffer<T extends NativeArray = NativeArray> = GLBufferMethods &
  GLBufferFields<T>;

const glBufferMethods: GLBufferMethods = {
  apply: function () {
    assertIsNotNull(this.buffer);
    assertIsNotNull(this.array);
    _gl.bindBuffer(this.target, this.buffer);
    _gl.bufferData(
      this.target,
      this.array.buffer.length,
      this.array.buffer,
      this.usage
    );
    _gl.bindBuffer(this.target, 0);
  },
  free: function () {
    if (this.array != null) {
      this.array = null;
    }
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
  options: Partial<Omit<GLBufferFields<T>, "array" | "buffer">>
): GLBuffer<T> {
  const init: GLBufferFields<T> = {
    array,
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
  const o = setmetatable(init, glArrayBufferMetatable as any) as GLBuffer<T>;

  const pBuffer = new_buffer(4);
  _gl.genBuffers(1, pBuffer);
  const buffer = pBuffer.get_int32(0);
  o.buffer = buffer;
  o.apply();
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
