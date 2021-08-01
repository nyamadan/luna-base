import { mat4, Mat4 } from "../math/mat4";
import {
  generateTypedNativeArrayFactory,
  isNativeArray,
  NativeArray,
} from "./native_array";

const prototype: Parameters<typeof generateTypedNativeArrayFactory>[0] = {
  name: "LUA_TYPE_F32ARRAY",
  byteSizePerElement: 4,
  isNativeArray: true,

  setElement: function (idx: number, value: number) {
    this.buffer.set_float32(idx * this.byteSizePerElement + this.offset, value);
  },

  getElement: function (idx: number) {
    return this.buffer.get_float32(idx * this.byteSizePerElement + this.offset);
  },
};

export interface F32Array extends NativeArray {
  name: "LUA_TYPE_F32ARRAY";
  byteSizePerElement: 4;
  isNativeArray: true;
}

export type F32Mat4 = F32Array & Mat4;

const factory = generateTypedNativeArrayFactory(prototype) as (
  ...args: Parameters<ReturnType<typeof generateTypedNativeArrayFactory>>
) => F32Array;

export function createF32Array(
  this: void,
  ...args: Parameters<typeof factory>
) {
  return factory(...args);
}

export function createF32Mat4(this: void): F32Mat4 {
  return mat4.identity(factory(16) as F32Mat4);
}

export function isF32Array(x: any): x is F32Array {
  return isNativeArray(x) && x.name == "LUA_TYPE_F32ARRAY";
}
