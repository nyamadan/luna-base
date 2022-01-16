// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LunaX from "luna-base/dist/gl_renderer/lunax";
import {
  createTaskRef,
  initCommandState,
  NodeTaskType,
} from "luna-base/dist/gl_renderer/node_task";
import ShaderProgramTask, {
  ShaderProgramTaskType,
} from "luna-base/dist/gl_renderer/shader_program_task";
import ShaderTask from "luna-base/dist/gl_renderer/shader_task";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_ShaderTaskType", {
  setUp() {},
  tearDown() {},
  test_shader_lunax() {
    const programRef = createTaskRef<ShaderProgramTaskType>();
    const root: NodeTaskType = (
      <ShaderProgramTask ref={programRef}>
        <ShaderTask type="VERTEX_SHADER">VS</ShaderTask>
        <ShaderTask type="FRAGMENT_SHADER">FS</ShaderTask>
      </ShaderProgramTask>
    );

    root.updateRefs();
    root.setup(initCommandState(null));
    lu.assertNotNil(programRef.task?.program);
    lu.assertEquals(programRef.task.program.vertexShader.source, "VS");
    lu.assertEquals(programRef.task.program.fragmentShader.source, "FS");
  },
});
