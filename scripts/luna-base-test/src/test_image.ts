import "luna-base";
import { createImage } from "luna-base/dist/gl_renderer/image";
import { createImageTask } from "luna-base/dist/gl_renderer/tasks/image_task";
import { initCommandState } from "luna-base/dist/gl_renderer/tasks/node_task";
import { createNullTask } from "luna-base/dist/gl_renderer/tasks/null_task";
import { createPngImage, isPngImage } from "luna-base/dist/images/png_image";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_Image", {
  setUp: function (this: void) {},
  tearDown: function (this: void) {},

  test_loadImage() {
    const img = createImage("./assets/waterfall-512x512.png");
    lu.assertEquals(img.getWidth(), 512);
    lu.assertEquals(img.getHeight(), 512);
    lu.assertEquals(img.getChannels(), 3);
    lu.assertEquals(img.getBitDepth(), 8);
  },

  test_loadImageTask() {
    const task = createNullTask();
    const image = createImageTask({ path: "./assets/waterfall-512x512.png" });
    task.addChild(image);
    const state = task.setup(initCommandState(null));

    const img = state.images[image.guid];
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
