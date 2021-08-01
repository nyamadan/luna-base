import { generateTypedNativeArrayFactory, NativeArray } from "./native_array";

const prototype: Parameters<typeof generateTypedNativeArrayFactory>[0] = {
  name: "LUA_TYPE_I16ARRAY",
  byteSizePerElement: 2,
  isNativeArray: true,

  setElement: function (idx: number, value: number) {
    this.buffer.set_int16(idx * this.byteSizePerElement + this.offset, value);
  },

  getElement: function (idx: number) {
    return this.buffer.get_int16(idx * this.byteSizePerElement + this.offset);
  },
};

export interface I16Array extends NativeArray {
  name: "LUA_TYPE_I16ARRAY";
  byteSizePerElement: 2;
  isNativeArray: true;
}

const factory = generateTypedNativeArrayFactory(prototype) as (
  ...args: Parameters<ReturnType<typeof generateTypedNativeArrayFactory>>
) => I16Array;

export function createI16Array(
  this: void,
  ...args: Parameters<typeof factory>
) {
  return factory(...args);
}
