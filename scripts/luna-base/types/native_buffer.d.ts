/** @noSelfInFile */
/** @noResolution */

declare module "native_buffer" {
  export type NativeBuffer = {
    get_string: () => string;
    set_string: (v: string) => number;
    get_bool: (byte_offset: number) => boolean;
    set_bool: (byte_offset: number, v: boolean) => void;
    get_uint8: (byte_offset: number) => number;
    set_uint8: (byte_offset: number, v: number) => void;
    get_uint16: (byte_offset: number) => number;
    set_uint16: (byte_offset: number, v: number) => void;
    get_int8: (byte_offset: number) => number;
    set_int8: (byte_offset: number, v: number) => void;
    get_int16: (byte_offset: number) => number;
    set_int16: (byte_offset: number, v: number) => void;
    get_int32: (byte_offset: number) => number;
    set_int32: (byte_offset: number, v: number) => void;
    get_float32: (byte_offset: number) => number;
    set_float32: (byte_offset: number, v: number) => void;
    set_pointer: (
      dst_offset: number,
      src: NativeBuffer,
      src_offset: number
    ) => void;
    copy_buffer: (
      dst_offset: number,
      src: NativeBuffer,
      src_offset: number,
      size: number
    ) => void;
    free: () => void;
    __native_buffer: never;
  } & Array<number>;
  export const SIZE_OF_POINTER: number;
  export const SIZE_OF_BOOL: number;
  export const NULL: NativeBuffer;
  export function new_buffer(
    size: number,
    option?: {
      buffer_type?: "any" | "unsafe_pointer";
      zero_clear?: boolean;
    }
  ): NativeBuffer;
  export function copy_buffer(
    dst: NativeBuffer,
    dst_offset: number,
    src: NativeBuffer,
    src_offset: number,
    size: number
  ): void;
  export function set_buffer_pointer(
    dst: NativeBuffer,
    dst_offset: number,
    src: NativeBuffer,
    src_offset: number
  ): void;
}
