import * as lu from "./lib/luaunit/luaunit";

import { vec3 } from "../src/math/vec3";
import { Command, createNode, NodeTaskId } from "../src/gl_renderer/node";
import { test } from "./utils";
import { createTransformTask } from "../src/gl_renderer/transform_task";
import { createTransform } from "../src/gl_renderer/transform";
import { uuid } from "../src/uuid";
import { mat4 } from "../src/math/mat4";

test("Test_Node", {
  setUp: function () {},
  tearDown: function () {},
  test_transform: function () {
    const root = createNode();

    const parent = createNode();
    const trParent = createTransform();
    parent.addTask(createTransformTask(trParent));
    lu.assertNotNil(trParent);
    vec3.set(trParent.position, 1, 1, 1);
    vec3.set(trParent.scale, 2, 2, 2);

    let command: Command | undefined;
    const child = createNode();
    child.addTask({
      id: uuid.v4() as NodeTaskId,
      run: function (x, state) {
        lu.assertNotNil(x);
        lu.assertIsNil(command);
        command = x;
        return state;
      },
    });

    const trChild = createTransform();
    child.addTask(createTransformTask(trChild));
    lu.assertNotNil(trChild);
    vec3.set(trChild.position, 1, 1, 1);
    vec3.set(trChild.scale, 2, 2, 2);

    root.addChild(parent);
    parent.addChild(child);

    const state = parent.update({ worlds: {} }, mat4.create());
    lu.assertEquals(
      // prettier-ignore
      trChild.local,
      [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1]
    );

    // lu.assertEquals(
    //   // prettier-ignore
    //   trChild.world,
    //   [
    //     4.0, 0.0, 0.0, 0.0,
    //     0.0, 4.0, 0.0, 0.0,
    //     0.0, 0.0, 4.0, 0.0,
    //     3.0, 3.0, 3.0, 1.0
    //   ],
    // );

    const world = state.worlds[child.id];
    lu.assertNotNil(world);
    const x = vec3.set(vec3.create(), 1, 2, 3);
    vec3.transformMat4(x, x, world);
    lu.assertEquals(x, [7, 11, 15]);
    lu.assertEquals(command?.name, "update");
    lu.assertEquals(root.flat(), [root, parent, child]);
  },
});
