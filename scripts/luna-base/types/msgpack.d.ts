/** @noSelfInFile */

interface MsgpackBuffer {
  serialize: (x: any) => void;
  free: () => void;
  dump: () => void;
}

/** @noResolution */
declare module "msgpack" {
  export function new_msgpack_buffer(): MsgpackBuffer;
}
