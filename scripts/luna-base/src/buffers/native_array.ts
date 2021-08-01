import { NativeBuffer, new_buffer } from "native_buffer";
import { getMetatableName, isNumber } from "../type_utils";

interface NativeArrayProperties {
  buffer: ReturnType<typeof new_buffer>;
  offset: number;
  size: number;
}

interface NativeArrayPrototype {
  name: string;
  byteSizePerElement: number;
  isNativeArray: true;
  setElement(this: NativeArray, idx: number, value: number): void;
  getElement(this: NativeArray, idx: number): number;
}

export type NativeArray = NativeArrayPrototype &
  NativeArrayProperties &
  number[];

type NativeArrayMetatable = LuaMetatable<NativeArray> & {
  __name?: string;
  prototype: NativeArrayPrototype;
};

export function generateTypedNativeArrayFactory(
  prototype: NativeArrayPrototype
) {
  const metatable: NativeArrayMetatable = {
    prototype,
    __name: prototype.name,

    __len: function () {
      return this.size / prototype.byteSizePerElement;
    },

    __index: function (key: any) {
      if (isNumber(key)) {
        const value = this.getElement(key - 1);
        return value;
      }

      return rawget(prototype, key);
    },

    __newindex: function (key: any, value: any) {
      if (isNumber(key)) {
        this.setElement(key - 1, value);
        return;
      }

      rawset(this, key, value);
    },

    __tostring: function () {
      const elems = [];
      const len = this.buffer.length / prototype.byteSizePerElement;
      for (let i = 0; i < len; i++) {
        elems.push(this.getElement(i));
      }
      return `${metatable.__name}: [${elems.join(", ")}]`;
    },
  };

  function constructor(
    ...args: [number] | [ReadonlyArray<number>] | [NativeBuffer, number, number]
  ) {
    const offset = isNativeBuffer(args[0])
      ? (args[2] || 0) * prototype.byteSizePerElement
      : 0;

    if (offset < 0) {
      error("Invalid offset");
    }

    const size =
      (isNumber(args[0])
        ? args[0]
        : isNativeBuffer(args[0])
        ? Math.min(args[1] || 0, args[0].length - offset)
        : args[0].length) * prototype.byteSizePerElement;

    if (size <= 0) {
      error("Invalid size");
    }

    const buffer = isNativeBuffer(args[0]) ? args[0] : new_buffer(size);

    const o = setmetatable<NativeArrayProperties>(
      {
        buffer,
        size,
        offset,
      },
      metatable as any
    ) as NativeArray;

    if (!isNativeBuffer(args[0]) && !isNumber(args[0])) {
      const src = args[0];
      const len = src.length;
      for (let i = 0; i < len; i++) {
        o[i] = src[i];
      }
    }

    return o;
  }

  return constructor;
}

export function isNativeArray(this: void, x: unknown): x is NativeArray {
  return !!(x as any)?.isNativeArray;
}

export function isNativeBuffer(this: void, x: unknown): x is NativeBuffer {
  return getMetatableName(x) === "LUA_USERDATA_TYPE_BUFFER";
}
