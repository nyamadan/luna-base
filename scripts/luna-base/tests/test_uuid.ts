import * as lu from "./lib/luaunit/luaunit";
import { uuid } from "../src/uuid";

import { test } from "./utils";

test("Test_UUID", {
  setUp: function () {},
  tearDown: function () {},
  test_stringify: function () {
    const a = uuid.v4();
    const b = uuid.v4();
    lu.assertNotEquals(a, b);
  },
});
