import { getLU, initGlfw } from "./utils";

import "./test_native_buffer";
import "./test_u8array";
import "./test_u16array";
import "./test_i8array";
import "./test_i16array";
import "./test_i32array";
import "./test_f32array";
import "./test_pointer_array";
import "./test_msgpack";
import "./test_image";
import "./test_uuid";

initGlfw();

import "./test_gl_program";
import "./test_gl_vertex_array";

import "./test_node";

const lu = getLU();
const runner = lu.LuaUnit.new();
runner.setOutputType("text");
os.exit(runner.runSuite());
