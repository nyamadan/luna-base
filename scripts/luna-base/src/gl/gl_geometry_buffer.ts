import * as _gl from "gl";
import { createF32Array, isF32Array } from "../buffers/f32array";
import { isNativeArray, NativeArray } from "../buffers/native_array";
import { createU16Array, isU16Array } from "../buffers/u16array";
import { GeometryBufferType } from "../gl_renderer/geometry_buffer";
import { floorDivisionNumber } from "../op_utils";
import { safeUnreachable } from "../unreachable";
import {
  createGLF32ArrayBuffer,
  createGLU16ArrayBuffer,
  isGlBuffer,
  GLBuffer,
} from "./gl_buffer";

interface GLGeometryBufferFields {
  mode: typeof _gl.TRIANGLES;
  buffers: Record<string, GLBuffer>;
}

interface GLGeometryBufferMethods {
  getNumComponents: (this: GLGeometryBuffer) => number | null;
  getIndicesType: (this: GLGeometryBuffer) => number | null;
}

export interface GLGeometryBuffer
  extends GLGeometryBufferFields,
    GLGeometryBufferMethods {}

const glGeometryBufferMethods: GLGeometryBufferMethods = {
  getIndicesType: function () {
    return this.buffers.indices?.type;
  },
  getNumComponents: function () {
    return this.buffers.indices?.numComponents;
  },
};

const glGeometryBufferMetatable = {
  __index: glGeometryBufferMethods,
  __gc(this: GLGeometryBuffer) {},
};

export function createGLGeometryBuffer(
  this: void,
  arrays: Record<string, GeometryBufferType<NativeArray> | GLBuffer>,
  {
    mode,
  }: Partial<{
    mode: GLGeometryBuffer["mode"];
  }> = {}
) {
  const init: GLGeometryBufferFields = {
    buffers: {},
    mode: mode ?? _gl.TRIANGLES,
  };

  const o = setmetatable(init, glGeometryBufferMetatable) as GLGeometryBuffer;

  o.buffers = Object.keys(arrays).reduce<Record<string, GLBuffer>>((a, key) => {
    const x = arrays[key];

    if (isGlBuffer(x)) {
      a[key] = x;
      return a;
    }

    const lowerKey = key.toLowerCase();
    const size =
      lowerKey.includes("coord") || lowerKey.includes("uv")
        ? 2
        : lowerKey.includes("normal") || lowerKey.includes("position")
        ? 3
        : 4;
    const numComponents = floorDivisionNumber(x.buffer.length, size);

    let usage: GLBuffer["usage"];

    switch (x.usage) {
      case "static": {
        usage = _gl.STATIC_DRAW;
        break;
      }

      case "dynamic": {
        usage = _gl.DYNAMIC_DRAW;
        break;
      }

      default: {
        safeUnreachable(x);
      }
    }

    if (isNativeArray(x.buffer)) {
      if (isF32Array(x.buffer)) {
        a[key] = createGLF32ArrayBuffer(x.buffer, {
          target: _gl.ARRAY_BUFFER,
          type: _gl.FLOAT,
          size,
          numComponents,
          usage,
        });
      } else if (isU16Array(x.buffer)) {
        if (key === "indices") {
          a[key] = createGLU16ArrayBuffer(x.buffer, {
            target: _gl.ELEMENT_ARRAY_BUFFER,
            type: _gl.UNSIGNED_SHORT,
            size: 1,
            numComponents: x.buffer.length,
          });
        } else {
          a[key] = createGLU16ArrayBuffer(x.buffer, {
            target: _gl.ARRAY_BUFFER,
            type: _gl.FLOAT,
            size,
            numComponents,
            usage,
          });
        }
      } else {
        error("Unsupported NativeArray.");
      }
      return a;
    }

    if (key === "indices") {
      a[key] = createGLU16ArrayBuffer(createU16Array(x.buffer), {
        target: _gl.ELEMENT_ARRAY_BUFFER,
        type: _gl.UNSIGNED_SHORT,
        size: 1,
        numComponents: x.buffer.length,
        usage,
      });
      return a;
    }

    a[key] = createGLF32ArrayBuffer(createF32Array(x.buffer), {
      target: _gl.ARRAY_BUFFER,
      type: _gl.FLOAT,
      size,
      numComponents,
      usage,
    });
    return a;
  }, {});

  return o;
}
