import * as lu from "./lib/luaunit/luaunit";
import { createI32Array, I32Array } from "../src/buffers/i32array";

import { test } from "./utils";

test("Test_I32Array", {
  buf: undefined as ReturnType<typeof createI32Array> | undefined,

  setUp: function () {
    this.buf = createI32Array(2);
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
    lu.assertEquals(this.buf[0], 10);
    lu.assertEquals(this.buf[1], 20);
  },
  test_index_tostring: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf[0] = 10;
    this.buf[1] = 20;
    lu.assertEquals(tostring(this.buf), "LUA_TYPE_I32ARRAY: [10, 20]");
  },
  test_release: function () {
    let buf: I32Array | null = createI32Array(2);
    const tbl = setmetatable({ buf: buf.buffer }, { __mode: "v" });
    buf = null;
    lu.assertNotIsNil(tbl.buf);
    collectgarbage();
    lu.assertNil(tbl.buf);
  },
});
