/** @noSelfInFile */
/** @noResolution */

declare module "png" {
  export function load_from_file(fp: LuaFile): {
    width: number;
    height: number;
    color_type: number;
    bit_depth: number;
    channels: number;
    buffer: { __native_buffer: never };
  };
}
