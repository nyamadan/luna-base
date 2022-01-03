import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

import "luna-base";
import * as _gl from "gl";
import { createPngImage, isPngImage } from "../src/images/png_image";
import { createImage } from "../src/gl_renderer/image";
import { createImageTask } from "../src/gl_renderer/image_task";
import { createNode, initCommandState } from "../src/gl_renderer/node";

test("Test_Image", {
  setUp: function (this: void) {},
  tearDown: function (this: void) {},

  test_loadImage() {
    const img = createImage();
    img.setup("./assets/waterfall-512x512.png");

    lu.assertEquals(img.getWidth(), 512);
    lu.assertEquals(img.getHeight(), 512);
    lu.assertEquals(img.getChannels(), 3);
    lu.assertEquals(img.getBitDepth(), 8);
  },

  test_loadImageTask() {
    const node = createNode();
    const image = createImageTask("./assets/waterfall-512x512.png");
    node.addTask(image);
    const state = node.setup(initCommandState(null));

    const img = state.images[image.id];
    lu.assertNotNil(img);
    lu.assertEquals(img.getWidth(), 512);
    lu.assertEquals(img.getHeight(), 512);
    lu.assertEquals(img.getChannels(), 3);
    lu.assertEquals(img.getBitDepth(), 8);
  },

  test_loadPngImage() {
    const result = createPngImage("./assets/image.png");
    if (!isPngImage(result)) {
      lu.fail(`Could not open image: ${result}.`);
      return;
    }

    const img = result;

    lu.assertEquals(img.width, 32);
    lu.assertEquals(img.height, 32);
    lu.assertEquals(img.color_type, 3);
    lu.assertEquals(img.bit_depth, 4);
    lu.assertEquals(img.channels, 1);
  },

  test_loadImage512x512(this: void) {
    const result = createPngImage("./assets/waterfall-512x512.png");
    if (!isPngImage(result)) {
      lu.fail(`Could not open image: ${result}.`);
      return;
    }

    const img = result;

    lu.assertEquals(img.width, 512);
    lu.assertEquals(img.height, 512);
    lu.assertEquals(img.color_type, 2);
    lu.assertEquals(img.bit_depth, 8);
    lu.assertEquals(img.channels, 3);
  },
});
