import * as lu from "./lib/luaunit/luaunit";
import { createI8Array, I8Array } from "../src/buffers/i8array";

import { test } from "./utils";

test("Test_I8Array", {
  buf: undefined as ReturnType<typeof createI8Array> | undefined,

  setUp: function () {
    this.buf = createI8Array(2);
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
    lu.assertEquals(tostring(this.buf), "LUA_TYPE_I8ARRAY: [10, 20]")
  },
  test_release: function () {
    let buf: I8Array | null = createI8Array(2);
    const tbl = setmetatable({ buf: buf.buffer }, { __mode: "v" });
    buf = null;
    lu.assertNotIsNil(tbl.buf);
    collectgarbage();
    lu.assertNil(tbl.buf);
  },
});