import {
  generateTypedNativeArrayFactory,
  isNativeArray,
  NativeArray,
} from "./native_array";

const prototype: Parameters<typeof generateTypedNativeArrayFactory>[0] = {
  name: "LUA_TYPE_U16ARRAY",
  byteSizePerElement: 2,
  isNativeArray: true,
  setElement: function (idx: number, value: number) {
    this.buffer.set_uint16(idx * this.byteSizePerElement + this.offset, value);
  },

  getElement: function (idx: number) {
    return this.buffer.get_uint16(idx * this.byteSizePerElement + this.offset);
  },
};

export interface U16Array extends NativeArray {
  name: "LUA_TYPE_U16ARRAY";
  byteSizePerElement: 2;
  isNativeArray: true;
}

const factory = generateTypedNativeArrayFactory(prototype) as (
  ...args: Parameters<ReturnType<typeof generateTypedNativeArrayFactory>>
) => U16Array;

export function createU16Array(
  this: void,
  ...args: Parameters<typeof factory>
) {
  return factory(...args);
}

export function isU16Array(x: any): x is U16Array {
  return isNativeArray(x) && x.name == "LUA_TYPE_U16ARRAY";
}
