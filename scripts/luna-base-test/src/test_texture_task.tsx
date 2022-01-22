import ImageTask, { ImageTaskType } from "luna-base/dist/gl_renderer/tasks/image_task";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LunaX from "luna-base/dist/gl_renderer/lunax";
import {
  createTaskRef,
  initCommandState,
  NodeTaskType
} from "luna-base/dist/gl_renderer/tasks/node_task";
import NullTask from "luna-base/dist/gl_renderer/tasks/null_task";
import TextureTask, { TextureTaskType } from "luna-base/dist/gl_renderer/tasks/texture_task";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

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
