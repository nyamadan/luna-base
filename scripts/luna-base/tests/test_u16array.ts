import { createU16Array, U16Array } from "../src/buffers/u16array";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_U16Array", {
  buf: undefined as ReturnType<typeof createU16Array> | undefined,

  setUp: function () {
    this.buf = createU16Array(2);
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
    lu.assertEquals(tostring(this.buf), "LUA_TYPE_U16ARRAY: [10, 20]");
  },
  test_new_with_array: function () {
    const buf: U16Array | null = createU16Array([100, 200, 300]);
    lu.assertEquals(buf.length, 3);
    lu.assertEquals(buf[0], 100);
    lu.assertEquals(buf[1], 200);
    lu.assertEquals(buf[2], 300);
  },
  test_release: function () {
    let buf: U16Array | null = createU16Array(2);
    const tbl = setmetatable({ buf: buf.buffer }, { __mode: "v" });
    buf = null;
    lu.assertNotIsNil(tbl.buf);
    collectgarbage();
    lu.assertNil(tbl.buf);
  },
});
