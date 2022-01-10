import * as lu from "./lib/luaunit/luaunit";

import vec3 from "../src/math/vec3";
import { test } from "./utils";
import mat4 from "../src/math/mat4";
import {
  Command,
  createNullTask,
  createTask,
  initCommandState,
  nodeTaskPrototype,
} from "../src/gl_renderer/node_task";

let origPrint: (this: void, ...args: any[]) => void;

test("Test_Node", {
  setUp: function () {
    origPrint = _G["print"];
    _G["print"] = () => {};
  },
  tearDown: function () {
    _G["print"] = origPrint;
  },
  test_task_enabled: function () {
    type StateType = typeof state;

    let called = 0;
    const root = createNullTask({ enabled: false });
    const task = createTask(
      null,
      {},
      {
        run: function (_, state) {
          called++;
          return state;
        },
        ...nodeTaskPrototype,
      }
    );
    root.addChild(task);
    const state = root.update(initCommandState(null));
    lu.assertIs(called, 0);
  },
  test_name: function () {
    const root = createNullTask({ name: "MyName" });
    lu.assertIs(root.name, "MyName");
  },
  test_task_name: function () {
    const task = createTask(
      null,
      { name: "MyTaskName" },
      {
        run(_, state) {
          return state;
        },
        ...nodeTaskPrototype,
      }
    );
    lu.assertIs(task.name, "MyTaskName");
  },
  test_error: function () {
    type StateType = typeof state;
    const root = createNullTask();
    root.addChild(
      createTask(
        null,
        {},
        {
          run: function (command, state) {
            error("error");
            return state;
          },
          ...nodeTaskPrototype,
        }
      )
    );
    const state = root.update(initCommandState(null));
    lu.success();
  },
  test_transform: function () {
    const root = createNullTask();

    const parent = createNullTask();
    const trParent = parent.transform;
    lu.assertNotNil(trParent);
    vec3.set(trParent.position, 1, 1, 1);
    vec3.set(trParent.scale, 2, 2, 2);

    let command: Command | undefined;
    const child = createNullTask();
    child.addChild(
      createTask(
        null,
        {},
        {
          run: function (x, state) {
            switch (x.name) {
              case "update-world": {
                lu.assertIsNil(command);
                command = x;
                return state;
              }
              default: {
                return state;
              }
            }
          },
          ...nodeTaskPrototype,
        }
      )
    );

    const trChild = child.transform;
    lu.assertNotNil(trChild);
    vec3.set(trChild.position, 1, 1, 1);
    vec3.set(trChild.scale, 2, 2, 2);

    root.addChild(parent);
    parent.addChild(child);

    const state = root.updateWorld(initCommandState(null), mat4.create());

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

    const world = state.worlds[child.guid];
    lu.assertNotNil(world);
    const x = vec3.set(vec3.create(), 1, 2, 3);
    vec3.transformMat4(x, x, world);
    lu.assertEquals(x, [7, 11, 15]);
    lu.assertEquals(command?.name, "update-world");
  },
});
