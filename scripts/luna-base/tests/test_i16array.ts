import { createI16Array, I16Array } from "../src/buffers/i16array";

import { getLU, test } from "./utils";

const lu = getLU();

test("Test_I16Array", {
  buf: undefined as ReturnType<typeof createI16Array> | undefined,

  setUp: function () {
    this.buf = createI16Array(2);
  },
  tearDown: function () {},
  test_length: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    lu.assertEquals(this.buf.length, 2);
  },
  test_index_access: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf[0] = 10;
    this.buf[1] = 20;
    lu.assertEquals(this.buf[0], 10)
    lu.assertEquals(this.buf[1], 20)
  },
  test_index_tostring: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf[0] = 10;
    this.buf[1] = 20;
    lu.assertEquals(tostring(this.buf), "LUA_TYPE_I16ARRAY: [10, 20]")
  },
  test_release: function () {
    let buf: I16Array | null = createI16Array(2);
    const tbl = setmetatable({ buf: buf.buffer }, { __mode: "v" });
    buf = null;
    lu.assertNotIsNil(tbl.buf);
    collectgarbage();
    lu.assertNil(tbl.buf);
  },
});