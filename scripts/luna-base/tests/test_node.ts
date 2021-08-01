import { vec3 } from "../src/math/vec3";
import {
  Command,
  createNode,
} from "../src/gl_renderer/node";
import { mat4 } from "../src/math/mat4";
import { assertIsNotNull, assertIsNull } from "../src/type_utils";

import { getLU, test } from "./utils";

const lu = getLU();

test("Test_Node", {
  setUp: function () {},
  tearDown: function () {},
  test_transform: function () {
    const root = createNode();

    const parent = createNode();
    const trParent = parent.transform;
    assertIsNotNull(trParent);
    vec3.set(trParent.position, 1, 1, 1);
    vec3.set(trParent.scale, 2, 2, 2);

    let command: Command | null = null;
    const child = createNode();
    child.addTask({
      run: function (x) {
        lu.assertNotNil(x);
        lu.assertIsNil(command);
        command = x;
      },
    });

    const trChild = child.transform;
    assertIsNotNull(trChild);
    vec3.set(trChild.position, 1, 1, 1);
    vec3.set(trChild.scale, 2, 2, 2);

    root.addChild(parent);
    parent.addChild(child);

    parent.update(mat4.create());
    lu.assertEquals(
      // prettier-ignore
      trChild.local,
      [
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        1, 1, 1, 1
      ],
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

    const x = vec3.set(vec3.create(), 1, 2, 3);
    vec3.transformMat4(x, x, trChild.world);
    lu.assertEquals(x, [7, 11, 15]);
    lu.assertEquals(command, { name: "update" });
    lu.assertEquals(root.flat(), [root, parent, child]);
  },
});
