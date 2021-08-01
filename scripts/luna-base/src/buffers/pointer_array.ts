import { new_buffer, SIZE_OF_POINTER } from "native_buffer";

interface NativeArrayProperties {
  buffer: ReturnType<typeof new_buffer>;
}

interface NativeArrayMethods {
  setPointer(
    this: NativeArray,
    idx: number,
    src: ReturnType<typeof new_buffer>,
    srcIdx: number
  ): void;
}

type NativeArray = NativeArrayMethods & NativeArrayProperties;

type NativeArrayMetatable = LuaMetatable<NativeArray> & {
  __name?: string;
  prototype: NativeArrayMethods;
};

interface Refs {
  refs: ReturnType<typeof new_buffer>[];
}

const prototype: NativeArrayMethods = {
  setPointer: function (this: NativeArray & Refs, idx, src, srcOffset) {
    this.buffer.set_pointer(idx * SIZE_OF_POINTER, src, srcOffset);
    this.refs[idx] = src;
  },
};

const metatable: NativeArrayMetatable = {
  prototype,
  __name: "LUA_TYPE_POINTER_ARRAY",

  __len: function () {
    return this.buffer.length / SIZE_OF_POINTER;
  },

  __index: prototype,
};

export type PointerArray = NativeArray &
  never[] & {
    __pointer_array: never;
  };

export const createPointerArray = function (length: number) {
  return setmetatable<NativeArrayProperties & Refs>(
    {
      buffer: new_buffer(length * SIZE_OF_POINTER, {
        buffer_type: "unsafe_pointer",
      }),
      refs: [],
    },
    metatable as any
  ) as unknown as PointerArray;
};
