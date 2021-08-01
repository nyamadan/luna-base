import { new_msgpack_buffer } from "msgpack";
import { getLU, test } from "./utils";

const lu = getLU();

test("Test_MsgPack", {
  buf: undefined as ReturnType<typeof new_msgpack_buffer> | undefined,

  setUp: function () {
    this.buf = new_msgpack_buffer();
  },
  tearDown: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf.free();
  },
  test_serialize: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf.serialize({
      x: 10,
      y: 20,
      z: 30,
    });
  },
});
