import { createPointerArray, PointerArray } from "luna-base/dist/buffers/pointer_array";
import { createU8Array, U8Array } from "luna-base/dist/buffers/u8array";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";


test("test_PointerArray", {
  buf: undefined as ReturnType<typeof createPointerArray> | undefined,

  setUp: function () {
    this.buf = createPointerArray(2);
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

    const buf = createU8Array(2);
    this.buf.setPointer(0, buf.buffer, 0);
  },
  test_release: function () {
    let a: U8Array | null = createU8Array(2);
    const tblA = setmetatable({ buf: a.buffer }, { __mode: "v" });
    lu.assertNotIsNil(tblA.buf);

    let b: PointerArray | null = createPointerArray(2);
    const tblB = setmetatable({ buf: b.buffer }, { __mode: "v" });
    b.setPointer(0, a.buffer, 0);

    a = null;
    collectgarbage();
    lu.assertNotIsNil(tblA.buf);

    b = null;
    collectgarbage();
    lu.assertNil(tblA.buf);
    lu.assertNil(tblB.buf);
  },
});
