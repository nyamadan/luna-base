import { createF32Vec4 } from "luna-base/dist/buffers/f32array";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LunaX from "luna-base/dist/gl_renderer/lunax";
import {
  createTaskRef,
  initCommandState,
  NodeTaskType,
} from "luna-base/dist/gl_renderer/node_task";
import Vec4Task, { Vec4TaskType } from "luna-base/dist/gl_renderer/vec4_task";
import vec4 from "luna-base/dist/math/vec4";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_Vec4TaskType", {
  setUp() {},
  tearDown() {},
  test_shader_lunax() {
    const vec4TaskRef = createTaskRef<Vec4TaskType>();
    const srcVec4 = vec4.create();
    vec4.set(srcVec4, 1, 2, 3, 4);
    const root: NodeTaskType = (
      <Vec4Task value={createF32Vec4(srcVec4)} ref={vec4TaskRef} />
    );

    root.updateRefs();
    root.setup(initCommandState(null));
    lu.assertNotNil(vec4TaskRef.task?.value);
    lu.assertEquals(vec4TaskRef.task.value.length, 4);
    for (let i = 0; i < 4; i++) {
      lu.assertEquals(vec4TaskRef.task.value[i], srcVec4[i]);
    }
  },
});
