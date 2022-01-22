import {
  Command,
  createNodeTaskPrototype,
  createTask,
  initCommandState,
} from "luna-base/dist/gl_renderer/tasks/node_task";
import { createNullTask } from "luna-base/dist/gl_renderer/tasks/null_task";
import { assertBasicTransform } from "luna-base/dist/gl_renderer/transforms/basic_transform";
import {
  assertOrthoCameraTransform,
  createOrthoCameraTransform,
} from "luna-base/dist/gl_renderer/transforms/ortho_camera_transform";
import mat4 from "luna-base/dist/math/mat4";
import vec3 from "luna-base/dist/math/vec3";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

let origPrint: typeof print;

test("Test_Node", {
  setUp() {
    origPrint = _G["print"];
    _G["print"] = () => {};
  },
  tearDown() {
    _G["print"] = origPrint;
  },
  test_task_enabled() {
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
  test_name() {
    const root = createNullTask({ name: "MyName" });
    lu.assertIs(root.name, "MyName");
  },
  test_task_name() {
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
  test_error() {
    const root = createNullTask();
    root.addChild(
      createTask(
        null,
        {},
        createNodeTaskPrototype({
          run() {
            error("error");
          },
        })
      )
    );
    root.update(initCommandState(null));
    lu.success();
  },
  test_transform() {
    const root = createNullTask();

    const parent = createNullTask();
    const trParent = parent.transform;
    assertBasicTransform(trParent);
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
    assertBasicTransform(trChild);
    vec3.set(trChild.position, 1, 1, 1);
    vec3.set(trChild.scale, 2, 2, 2);

    root.addChild(parent);
    parent.addChild(child);

    const state = root.updateWorld(initCommandState(null), mat4.create());

    lu.assertEquals(
      // prettier-ignore
      trChild.matrix,
      [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1]
    );

    const world = state.worlds[child.guid];
    lu.assertNotNil(world);
    const x = vec3.set(vec3.create(), 1, 2, 3);
    vec3.transformMat4(x, x, world);
    lu.assertEquals(x, [7, 11, 15]);
    lu.assertEquals(command?.name, "update-world");
  },
  test_ortho_camera_transform() {
    const root = createNullTask();

    const parent = createNullTask({ transform: createOrthoCameraTransform() });
    const trParent = parent.transform;
    assertOrthoCameraTransform(trParent);

    const child = createNullTask();
    const trChild = child.transform;
    assertBasicTransform(trChild);
    vec3.set(trChild.position, 1, 1, 0);

    root.addChild(parent);
    parent.addChild(child);

    const state = root.updateWorld(initCommandState(null), mat4.create());
    const world = state.worlds[child.guid];
    lu.assertNotNil(world);
    const v = vec3.set(vec3.create(), 1, 2, 0);
    vec3.transformMat4(v, v, world);
    lu.assertEquals(v.slice(0, 2), [4, 6]);
  },
  test_ortho_camera_lookAt() {
    const root = createNullTask();

    const parent = createNullTask({
      transform: createOrthoCameraTransform({
        top: 1.0,
        bottom: -1.0,
        left: -1.0,
        right: 1.0,
      }),
    });
    const trParent = parent.transform;
    assertOrthoCameraTransform(trParent);
    trParent.lookAt([1, 2, 1], [1, 2, 0], [0, 1, 0]);

    const child = createNullTask();
    const trChild = child.transform;
    assertBasicTransform(trChild);

    root.addChild(parent);
    parent.addChild(child);

    const state = root.updateWorld(initCommandState(null), mat4.create());
    const world = state.worlds[child.guid];
    lu.assertNotNil(world);
    const v = vec3.set(vec3.create(), 1, 2, 0);
    vec3.transformMat4(v, v, world);
    lu.assertEquals(v.slice(0, 2), [0, 0]);
  },
});
