import { logger } from "../src/logger";
import { LuaUnit } from "./lib/luaunit/luaunit";
import "./test_f32array";
import "./test_gl_program";
import "./test_gl_vertex_array";
import "./test_i16array";
import "./test_i32array";
import "./test_i8array";
import "./test_image";
import "./test_logger";
import "./test_lunax";
import "./test_msgpack";
import "./test_native_buffer";
import "./test_node";
import "./test_pointer_array";
import "./test_shader_task";
import "./test_texture_task";
import "./test_u16array";
import "./test_u8array";
import "./test_uuid";
import "./test_vec4_task";
import { initGlfw } from "./utils";

initGlfw();

logger.setLevel("ERROR");

const runner = LuaUnit.new();
runner.setOutputType("text");
os.exit(runner.runSuite());
