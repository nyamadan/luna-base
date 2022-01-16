import { createF32Array, F32Array } from "../src/buffers/f32array";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_F32Array", {
  buf: undefined as ReturnType<typeof createF32Array> | undefined,

  setUp: function () {
    this.buf = createF32Array(2);
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
  test_slice: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf[0] = 10;
    this.buf[1] = 20;

    const a = createF32Array(this.buf.buffer, 1, 0);
    const b = createF32Array(this.buf.buffer, 1, 1);

    lu.assertEquals(a.length, 1);
    lu.assertEquals(a[0], 10);
    lu.assertEquals(b.length, 1);
    lu.assertEquals(b[0], 20);
    lu.assertEquals(a.buffer, b.buffer);
  },
  test_index_tostring: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf[0] = 10;
    this.buf[1] = 20;
    lu.assertEquals(tostring(this.buf), "LUA_TYPE_F32ARRAY: [10.0, 20.0]");
  },
  test_release: function () {
    let buf: F32Array | null = createF32Array(2);
    const tbl = setmetatable({ buf: buf.buffer }, { __mode: "v" });
    buf = null;
    lu.assertNotIsNil(tbl.buf);
    collectgarbage();
    lu.assertNil(tbl.buf);
  },
});
