import * as _gl from "gl";
import { new_buffer, NULL } from "native_buffer";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { assertIsNotNull, assertIsNumber } from "../type_utils";
import { GLGeometryBuffer } from "./gl_geometry_buffer";
import { GLProgram } from "./gl_program";

const TABLE_NAME = allocTableName("LUA_TYPE_GL_VERTEX_ARRAY");

interface GLVertexArrayFields {
  vao: number | null;
  geometry: GLGeometryBuffer;
}

interface GLVertexArrayMethods {
  getGeometryMode: (this: GLVertexArray) => number;
  getIndicesType: (this: GLVertexArray) => number | null;
  getNumComponents: (this: GLVertexArray) => number | null;
  bind: (this: GLVertexArray) => void;
  unbind: (this: GLVertexArray) => void;
  free: (this: GLVertexArray) => void;
}

export type GLVertexArray = GLVertexArrayMethods & GLVertexArrayFields;

const prototype: GLVertexArrayMethods = {
  getGeometryMode: function () {
    return this.geometry.mode;
  },
  getIndicesType: function () {
    return this.geometry.getIndicesType();
  },
  getNumComponents: function () {
    return this.geometry.getNumComponents();
  },
  unbind: function () {
    _gl.bindVertexArray(0);
  },
  bind: function () {
    assertIsNotNull(this.vao);
    _gl.bindVertexArray(this.vao);
  },
  free: function () {
    if (this.vao == null) {
      return;
    }

    const p = new_buffer(4);
    p.set_int32(0, this.vao);
    _gl.deleteVertexArrays(1, p);
    this.vao = null;
  },
};

export function createGLVertexArray(
  this: void,
  program: GLProgram,
  geometry: GLGeometryBuffer
): GLVertexArray {
  const fields = {} as GLVertexArrayFields;

  const o = createTable(TABLE_NAME, fields, prototype, function () {
    this.free();
  });

  const pVAO = new_buffer(4);
  _gl.genVertexArrays(1, pVAO);
  const vao = pVAO.get_int32(0);
  _gl.bindVertexArray(vao);

  for (const [key, buffer] of Object.entries(geometry.buffers)) {
    assertIsNumber(buffer.buffer);

    const attribute = program.attributes.find((x) => x.name === key);
    if (attribute != null) {
      _gl.bindBuffer(buffer.target, buffer.buffer);
      _gl.enableVertexAttribArray(attribute.location);
      _gl.vertexAttribPointer(
        attribute.location,
        buffer.size,
        buffer.type,
        buffer.normalized || false,
        buffer.stride || 0,
        NULL
      );
    }
  }

  if (geometry.buffers.indices != null) {
    const indices = geometry.buffers.indices;
    assertIsNotNull(indices.buffer);
    _gl.bindBuffer(indices.target, indices.buffer);
  }

  _gl.bindVertexArray(0);
  _gl.bindBuffer(_gl.ARRAY_BUFFER, 0);
  _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, 0);

  o.vao = vao;
  o.geometry = geometry;

  return o;
}

export function isGLVertexArray(this: void, x: unknown): x is GLVertexArray {
  return getMetatableName(x) === TABLE_NAME;
}
