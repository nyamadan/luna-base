import { generateTypedNativeArrayFactory, NativeArray } from "./native_array";

const prototype: Parameters<typeof generateTypedNativeArrayFactory>[0] = {
  name: "LUA_TYPE_I32ARRAY",
  byteSizePerElement: 4,
  isNativeArray: true,

  setElement: function (idx: number, value: number) {
    this.buffer.set_int32(idx * this.byteSizePerElement + this.offset, value);
  },

  getElement: function (idx: number) {
    return this.buffer.get_int32(idx * this.byteSizePerElement + this.offset);
  },
};

export interface I32Array extends NativeArray {
  name: "LUA_TYPE_I32ARRAY";
  byteSizePerElement: 4;
  isNativeArray: true;
}

const factory = generateTypedNativeArrayFactory(prototype) as (
  ...args: Parameters<ReturnType<typeof generateTypedNativeArrayFactory>>
) => I32Array;

export function createI32Array(
  this: void,
  ...args: Parameters<typeof factory>
) {
  return factory(...args);
}
