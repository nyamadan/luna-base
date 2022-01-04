/// <reference path="../types/index.d.ts" />

import { setErrorLogger } from "utils";
import { logger } from "./logger";
setErrorLogger(function (this: void, msg: string) {
  logger.error("%s", msg);
});
import { inspect as __inspect } from "./lib/inspect/inspect";
import "./uuid";
import "./tables";
import "./buffers/pointer_array";
import "./buffers/native_array";
import "./buffers/u8array";
import "./buffers/u16array";
import "./buffers/i8array";
import "./buffers/i16array";
import "./buffers/i32array";
import "./buffers/f32array";
import "./gl/gl_buffer";
import "./gl/gl_geometry_buffer";
import "./gl/gl_program";
import "./gl/gl_texture";
import "./gl/gl_vertex_array";
import "./math/math_common";
import "./op_utils";
import "./platform";
import "./images/png_image";
import "./tprint";
import "./type_utils";
import "./math/vec3";
import "./math/mat4";

import "./gl_renderer/node";
import "./gl_renderer/node_task";
import "./gl_renderer/application_task";
import "./gl_renderer/gl_renderer";
import "./gl_renderer/gl_renderer_task";
import "./gl_renderer/geometry";
import "./gl_renderer/shader";
import "./gl_renderer/shader_program";
import "./gl_renderer/basic_shader_program";
import "./gl_renderer/material";
import "./gl_renderer/sub_mesh";
import "./gl_renderer/sub_mesh_task";
import "./gl_renderer/transform";
import "./gl_renderer/transform_task";
import "./gl_renderer/texture";
import "./gl_renderer/image";
import "./gl_renderer/image_task";
import "./gl_renderer/imgui_render_nodes";
import "./gl_renderer/primitives";

import "./gl_renderer/components/node_component";
import "./gl_renderer/components/task_component";
import "./gl_renderer/components/image_task";
import "./gl_renderer/components/mesh_task";
import "./gl_renderer/components/sub_mesh_task";
import "./gl_renderer/components/texture_image_task";
import "./gl_renderer/components/gl_renderer_task";
