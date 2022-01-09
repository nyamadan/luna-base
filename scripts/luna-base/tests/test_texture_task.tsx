import * as lu from "./lib/luaunit/luaunit";
import LunaX from "../src/gl_renderer/lunax";
import { test } from "./utils";
import Node from "../src/gl_renderer/components/node_component";
import {
  initCommandState,
  NodeField,
  NodePrototype,
} from "../src/gl_renderer/node";
import TextureTask from "../src/gl_renderer/components/texture_task";
import ImageTask from "../src/gl_renderer/components/image_task";
import { createTaskRef } from "../src/gl_renderer/node_task";
import { TextureTaskType } from "../src/gl_renderer/texture_task";
import { ImageTaskType } from "../src/gl_renderer/image_task";

test("Test_ImageTaskType", {
  setUp() {},
  tearDown() {},
  test_specify_image() {
    const textureRef = createTaskRef<TextureTaskType>();
    const imageRef = createTaskRef<ImageTaskType>();
    const root: NodeField & NodePrototype<null> = (
      <Node>
        <ImageTask ref={imageRef} path="./assets/waterfall-512x512.png" />
        <TextureTask ref={textureRef} imageTaskRef={imageRef} />
      </Node>
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
    const root: NodeField & NodePrototype<null> = (
      <Node>
        <TextureTask ref={textureRef}>
          <ImageTask ref={imageRef} path="./assets/waterfall-512x512.png" />
        </TextureTask>
      </Node>
    );

    root.updateRefs();
    root.setup(initCommandState(null));
    lu.assertNotNil(textureRef.task?.texture?.guid);
    lu.assertNotNil(imageRef.task?.guid);
    lu.assertEquals(textureRef.task.texture.imageTaskGuid, imageRef.task.guid);
  },
});
