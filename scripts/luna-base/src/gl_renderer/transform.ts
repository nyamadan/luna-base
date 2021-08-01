import * as _gl from "gl";
import {
  createF32Mat4,
  F32Mat4,
} from "../buffers/f32array";
import { mat4, Mat4 } from "../math/mat4";
import { quat, Quat } from "../math/quat";
import { vec3, Vec3 } from "../math/vec3";

interface TransformFields {
  local: Mat4;
  world: F32Mat4;
  position: Vec3;
  scale: Vec3;
  origin: Vec3;
  rotation: Quat;
}

interface TransformPrototype {
  update: (this: TransformFields, world: Mat4) => void;
}

export type Transform = TransformPrototype & TransformFields;

const prototype: TransformPrototype = {
  update: function (world) {
    mat4.fromRotationTranslationScaleOrigin(
      this.local,
      this.rotation,
      this.position,
      this.scale,
      this.origin
    );
    mat4.mul(this.world, world, this.local);
  },
};

const metatable = {
  __index: prototype,
  __name: "LUA_TYPE_TRANSFORM",
  __gc: function (this: Transform) {},
};

export function createTransform(this: void) {
  const fields: TransformFields = {
    world: createF32Mat4(),
    local: mat4.create(),
    origin: vec3.create(),
    position: vec3.create(),
    scale: vec3.set(vec3.create(), 1, 1, 1),
    rotation: quat.create(),
  };
  const o = setmetatable(fields, metatable) as Transform;
  return o;
}
