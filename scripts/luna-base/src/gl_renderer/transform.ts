import mat4, { Mat4 } from "../math/mat4";
import quat, { Quat } from "../math/quat";
import vec3, { Vec3 } from "../math/vec3";
import { allocTableName, createTable } from "../tables";

const TABLE_NAME = allocTableName("LUA_TYPE_TRANSFORM");

interface TransformFields {
  local: Mat4;
  position: Vec3;
  scale: Vec3;
  origin: Vec3;
  rotation: Quat;
}

interface TransformPrototype {
  update: (this: TransformFields) => void;
}

export type Transform = TransformFields & TransformPrototype;

const prototype: TransformPrototype = {
  update: function () {
    mat4.fromRotationTranslationScaleOrigin(
      this.local,
      this.rotation,
      this.position,
      this.scale,
      this.origin
    );
  },
};

export function createTransform(this: void) {
  const fields: TransformFields = {
    local: mat4.create(),
    origin: vec3.create(),
    position: vec3.create(),
    scale: vec3.set(vec3.create(), 1, 1, 1),
    rotation: quat.create(),
  };
  return createTable(TABLE_NAME, fields, prototype);
}
