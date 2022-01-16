import {
  Command,
  createNodeTaskPrototype,
  createTask,
  initCommandState,
} from "../src/gl_renderer/node_task";
import { createNullTask } from "../src/gl_renderer/null_task";
import mat4 from "../src/math/mat4";
import vec3 from "../src/math/vec3";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

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
    let called = 0;
    const root = createNullTask({ enabled: false });
    const task = createTask(
      null,
      {},
      createNodeTaskPrototype({
        run: function (_, state) {
          called++;
          return state;
        },
      })
    );
    root.addChild(task);
    root.update(initCommandState(null));
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
      createNodeTaskPrototype({
        run(_, state) {
          return state;
        },
      })
    );
    lu.assertIs(task.name, "MyTaskName");
  },
  test_error: function () {
    const root = createNullTask();
    root.addChild(
      createTask(
        null,
        {},
        createNodeTaskPrototype({
          run: function (command, state) {
            error("error");
            return state;
          },
        })
      )
    );
    root.update(initCommandState(null));
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
        createNodeTaskPrototype({
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
        })
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
