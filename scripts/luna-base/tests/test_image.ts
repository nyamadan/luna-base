import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

import "luna-base";
import * as _gl from "gl";
import { createPngImage } from "../src/images/png_image";

test("Test_Image", {
  setUp: function (this: void) {},
  tearDown: function (this: void) {},

  test_loadImage: function (this: void) {
    const result = createPngImage("./assets/image.png");
    if (result[0] != null) {
      const err = result[0];
      lu.fail(`Could not open image: ${err}.`);
      return;
    }

    const img = result[1];

    lu.assertEquals(img.width, 32);
    lu.assertEquals(img.height, 32);
    lu.assertEquals(img.color_type, 3);
    lu.assertEquals(img.bit_depth, 4);
    lu.assertEquals(img.channels, 1);
  },

  test_loadImage512x512: function (this: void) {
    const result = createPngImage("./assets/waterfall-512x512.png");
    if (result[0] != null) {
      const err = result[0];
      lu.fail(`Could not open image: ${err}.`);
      return;
    }

    const img = result[1];

    lu.assertEquals(img.width, 512);
    lu.assertEquals(img.height, 512);
    lu.assertEquals(img.color_type, 2);
    lu.assertEquals(img.bit_depth, 8);
    lu.assertEquals(img.channels, 3);
  },
});
