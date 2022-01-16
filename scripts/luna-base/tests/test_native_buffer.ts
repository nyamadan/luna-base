import {
  copy_buffer,
  new_buffer,
  set_buffer_pointer,
  SIZE_OF_BOOL,
  SIZE_OF_POINTER
} from "native_buffer";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_Buffer", {
  buf: undefined as ReturnType<typeof new_buffer> | undefined,

  setUp: function () {
    this.buf = new_buffer(8);
  },
  tearDown: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    this.buf.free();
  },
  test_copy: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    const a = this.buf;
    a.set_string("00000");
    const b = new_buffer(8);
    b.set_string("Hello");
    copy_buffer(a, 0, b, 0, 6);
    lu.assertEquals(a.get_string(), "Hello");

    a.set_string("00000");
    b.set_string("olleH");
    a.copy_buffer(0, b, 0, 6);
    lu.assertEquals(a.get_string(), "olleH");

    b.free();
  },
  test_size_of_pointer: function () {
    lu.assertIsNumber(SIZE_OF_POINTER);
    lu.successIf(SIZE_OF_POINTER > 0);
  },
  test_size_of_bool: function () {
    lu.assertIsNumber(SIZE_OF_BOOL);
    lu.successIf(SIZE_OF_BOOL > 0);
  },
  test_length: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }
    lu.assertEquals(this.buf.length, 8);
  },
  test_set_pointer: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    const a = this.buf;
    const b = new_buffer(8, { buffer_type: "unsafe_pointer" });
    set_buffer_pointer(b, 0, a, 0);
    b.set_pointer(0, a, 0);
    b.free();
  },
  test_get_set_string: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    lu.assertEquals(this.buf.set_string("Hello World!!"), this.buf.length);
    lu.assertEquals(this.buf.get_string(), "Hello Wo");

    lu.assertEquals(this.buf.set_string("Hello"), 5);
    lu.assertEquals(this.buf.get_string(), "Hello");
  },
  test_get_set_bool: function () {
    const buf = new_buffer(SIZE_OF_BOOL * 2);
    buf.set_bool(0, false);
    buf.set_bool(SIZE_OF_BOOL, true);

    lu.assertEquals(buf.get_bool(0), false);
    lu.assertEquals(buf.get_bool(SIZE_OF_BOOL), true);
  },
  test_get_set_uint8: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    this.buf.set_uint8(0, 32);

    lu.assertEquals(this.buf.get_uint8(0), 32);
  },
  test_get_set_uint16: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    this.buf.set_uint16(0, 32);

    lu.assertEquals(this.buf.get_uint16(0), 32);
  },
  test_get_set_int8: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    this.buf.set_int8(0, 32);

    lu.assertEquals(this.buf.get_int8(0), 32);
  },
  test_get_set_int16: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    this.buf.set_int16(0, 32);

    lu.assertEquals(this.buf.get_int16(0), 32);
  },
  test_get_set_int32: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    this.buf.set_int32(0, 32);

    lu.assertEquals(this.buf.get_int32(0), 32);
  },
  test_get_set_float32: function () {
    if (this.buf == null) {
      lu.fail("buf is nil");
      return;
    }

    this.buf.set_float32(0, 32.25);

    lu.assertEquals(this.buf.get_float32(0), 32.25);
  },
});
