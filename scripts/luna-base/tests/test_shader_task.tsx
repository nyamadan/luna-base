import * as lu from "./lib/luaunit/luaunit";
import LunaX from "../src/gl_renderer/lunax";
import { test } from "./utils";
import {
  createTaskRef,
  initCommandState,
  NodeTaskType,
} from "../src/gl_renderer/node_task";
import ShaderTask from "../src/gl_renderer/components/shader_task";
import ShaderProgramTask from "../src/gl_renderer/components/shader_program_task";
import { ShaderProgramTaskType } from "../src/gl_renderer/shader_program_task";

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