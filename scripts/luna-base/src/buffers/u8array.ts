import { generateTypedNativeArrayFactory, NativeArray } from "./native_array";

const prototype: Parameters<typeof generateTypedNativeArrayFactory>[0] = {
  name: "LUA_TYPE_U8ARRAY",
  byteSizePerElement: 1,
  isNativeArray: true,
  setElement: function (idx: number, value: number) {
    this.buffer.set_uint8(idx + this.offset, value);
  },

  getElement: function (idx: number) {
    return this.buffer.get_uint8(idx + this.offset);
  },
};

export interface U8Array extends NativeArray {
  name: "LUA_TYPE_U8ARRAY";
  byteSizePerElement: 1;
  isNativeArray: true;
}

const factory = generateTypedNativeArrayFactory(prototype) as (
  ...args: Parameters<ReturnType<typeof generateTypedNativeArrayFactory>>
) => U8Array;

export function createU8Array(this: void, ...args: Parameters<typeof factory>) {
  return factory(...args);
}
