import "luna-base";
import { createInputTask } from "luna-base/dist/gl_renderer/tasks/input_task";
import { initCommandState } from "luna-base/dist/gl_renderer/tasks/node_task";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_InputTask", {
  setUp: function (this: void) {},
  tearDown: function (this: void) {},

  test_mouseKeyDown() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "MOUSE_BUTTON_DOWN",
        button: 1,
      },
    ]);

    lu.assertEquals(state.mouse.state[1], "DOWN");
  },

  test_mouseKeyUp() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "MOUSE_BUTTON_UP",
        button: 1,
      },
    ]);

    lu.assertEquals(state.mouse.state[1], "UP");
  },

  test_mouseKeyDownUp() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "MOUSE_BUTTON_DOWN",
        button: 1,
      },
    ]);
    lu.assertEquals(state.mouse.state[1], "DOWN");

    state = task.input(state, [
      {
        type: "MOUSE_BUTTON_UP",
        button: 1,
      },
    ]);
    lu.assertEquals(state.mouse.state[1], "UP");
  },

  test_mouseMove() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "MOUSE_MOVE",
        posx: 10,
        posy: 20,
      },
    ]);
    lu.assertEquals(state.mouse.x, 10);
    lu.assertEquals(state.mouse.y, 20);
  },

  test_mouseMoveDown() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "MOUSE_MOVE",
        posx: 10,
        posy: 20,
      },
    ]);
    lu.assertEquals(state.mouse.x, 10);
    lu.assertEquals(state.mouse.y, 20);

    state = task.input(state, [
      {
        type: "MOUSE_BUTTON_DOWN",
        button: 1,
      },
    ]);
    lu.assertEquals(state.mouse.state[1], "DOWN");
    lu.assertEquals(state.mouse.x, 10);
    lu.assertEquals(state.mouse.y, 20);
  },

  test_inputKeyDown() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "KEY_DOWN",
        code: 10,
      },
    ]);

    lu.assertEquals(state.keys.state[10], "DOWN");
  },

  test_inputMultiKeyDown() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "KEY_DOWN",
        code: 10,
      },
    ]);

    lu.assertEquals(state.keys.state[10], "DOWN");

    state = task.input(state, [
      {
        type: "KEY_DOWN",
        code: 20,
      },
    ]);
    lu.assertEquals(state.keys.state[10], "DOWN");
    lu.assertEquals(state.keys.state[20], "DOWN");
  },

  test_inputKeyUp() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "KEY_UP",
        code: 10,
      },
    ]);

    lu.assertEquals(state.keys.state[10], "UP");
  },

  test_inputKeyDownUp() {
    const task = createInputTask();
    let state = task.setup(initCommandState(null));

    state = task.input(state, [
      {
        type: "KEY_DOWN",
        code: 10,
      },
    ]);
    lu.assertEquals(state.keys.state[10], "DOWN");

    state = task.input(state, [
      {
        type: "KEY_UP",
        code: 10,
      },
    ]);
    lu.assertEquals(state.keys.state[10], "UP");
  },
});
