import * as lu from "./lib/luaunit/luaunit";
import LunaX from "../src/gl_renderer/lunax";
import { test } from "./utils";
import TextureTask from "../src/gl_renderer/components/texture_task";
import ImageTask from "../src/gl_renderer/components/image_task";
import {
  createTaskRef,
  initCommandState,
  NodeTaskType,
} from "../src/gl_renderer/node_task";
import { TextureTaskType } from "../src/gl_renderer/texture_task";
import { ImageTaskType } from "../src/gl_renderer/image_task";
import NullTask from "../src/gl_renderer/components/null_task";

test("Test_ImageTaskType", {
  setUp() {},
  tearDown() {},
  test_specify_image() {
    const textureRef = createTaskRef<TextureTaskType>();
    const imageRef = createTaskRef<ImageTaskType>();
    const root: NodeTaskType = (
      <NullTask>
        <ImageTask ref={imageRef} path="./assets/waterfall-512x512.png" />
        <TextureTask ref={textureRef} imageTaskRef={imageRef} />
      </NullTask>
    );

    root.updateRefs();
    root.setup(initCommandState(null));
    lu.assertNotNil(textureRef.task?.texture?.guid);
    lu.assertNotNil(imageRef.task?.guid);
    lu.assertEquals(textureRef.task.texture.imageTaskGuid, imageRef.task.guid);
  },
  test_child_image() {
    const textureRef = createTaskRef<TextureTaskType>();
    const imageRef = createTaskRef<ImageTaskType>();
    const root: NodeTaskType = (
      <NullTask>
        <TextureTask ref={textureRef}>
          <ImageTask ref={imageRef} path="./assets/waterfall-512x512.png" />
        </TextureTask>
      </NullTask>
    );

    root.updateRefs();
    root.setup(initCommandState(null));
    lu.assertNotNil(textureRef.task?.texture?.guid);
    lu.assertNotNil(imageRef.task?.guid);
    lu.assertEquals(textureRef.task.texture.imageTaskGuid, imageRef.task.guid);
  },
});
