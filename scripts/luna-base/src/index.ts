// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/index.d.ts" />
import { setErrorLogger } from "utils";
import "./buffers/f32array";
import "./buffers/i16array";
import "./buffers/i32array";
import "./buffers/i8array";
import "./buffers/native_array";
import "./buffers/pointer_array";
import "./buffers/u16array";
import "./buffers/u8array";
import "./gl/gl_buffer";
import "./gl/gl_geometry_buffer";
import "./gl/gl_program";
import "./gl/gl_texture";
import "./gl/gl_vertex_array";
import "./gl_renderer/application_task";
import "./gl_renderer/basic_shader_program";
import "./gl_renderer/components/geometry_task";
import "./gl_renderer/components/gl_renderer_task";
import "./gl_renderer/components/image_task";
import "./gl_renderer/components/material_task";
import "./gl_renderer/components/mesh_task";
import "./gl_renderer/components/null_task";
import "./gl_renderer/components/shader_program_task";
import "./gl_renderer/components/shader_task";
import "./gl_renderer/components/sub_mesh_task";
import "./gl_renderer/components/task_component";
import "./gl_renderer/components/texture_task";
import "./gl_renderer/components/vec4_task";
import "./gl_renderer/geometry";
import "./gl_renderer/gl_renderer";
import "./gl_renderer/gl_renderer_task";
import "./gl_renderer/image";
import "./gl_renderer/image_task";
import "./gl_renderer/imgui_render_nodes";
import "./gl_renderer/material";
import "./gl_renderer/material_task";
import "./gl_renderer/node_task";
import "./gl_renderer/primitives";
import "./gl_renderer/shader";
import "./gl_renderer/shader_program";
import "./gl_renderer/shader_program_task";
import "./gl_renderer/shader_task";
import "./gl_renderer/sub_mesh";
import "./gl_renderer/sub_mesh_task";
import "./gl_renderer/texture";
import "./gl_renderer/transform";
import "./gl_renderer/vec4_task";
import "./images/png_image";
import "./lib/inspect/inspect";
import { logger } from "./logger";
import "./math/mat4";
import "./math/math_common";
import "./math/vec3";
import "./op_utils";
import "./platform";
import "./tables";
import "./tprint";
import "./type_utils";
import "./uuid";
setErrorLogger(function (this: void, msg: string) {
  logger.error("%s", msg);
});
