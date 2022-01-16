import Vec4Task from "../dist/gl_renderer/components/vec4_task";
import { Vec4TaskType } from "../dist/gl_renderer/vec4_task";
import { createF32Vec4 } from "../src/buffers/f32array";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LunaX from "../src/gl_renderer/lunax";
import {
  createTaskRef,
  initCommandState,
  NodeTaskType,
} from "../src/gl_renderer/node_task";
import vec4 from "../src/math/vec4";
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
