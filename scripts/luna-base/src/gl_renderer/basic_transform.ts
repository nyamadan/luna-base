import mat4 from "../math/mat4";
import quat, { Quat } from "../math/quat";
import vec3, { Vec3 } from "../math/vec3";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { TransformFields, TransformPrototype } from "./transform";

const TABLE_NAME = allocTableName("LUA_TYPE_BASIC_TRANSFORM");

interface BasicTransformFields extends TransformFields {
  position: Vec3;
  scale: Vec3;
  origin: Vec3;
  rotation: Quat;
}

interface BasicTransformPrototype extends TransformPrototype {
  update(this: BasicTransformType): void;
}

export interface BasicTransformType
  extends BasicTransformFields,
    BasicTransformPrototype {}

const prototype: BasicTransformPrototype = {
  update() {
    mat4.fromRotationTranslationScaleOrigin(
      this.matrix,
      this.rotation,
      this.position,
      this.scale,
      this.origin
    );
  },
};

export function createBasicTransform(this: void) {
  const fields: BasicTransformFields = {
    matrix: mat4.create(),
    origin: vec3.create(),
    position: vec3.create(),
    scale: vec3.set(vec3.create(), 1, 1, 1),
    rotation: quat.create(),
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isBasicTransform(
  this: void,
  x: unknown
): x is BasicTransformType {
  return getMetatableName(x) === TABLE_NAME;
}

export function assertBasicTransform(
  this: void,
  x: unknown,
  message?: string
): asserts x is BasicTransformType {
  assert(isBasicTransform(x), message ?? "value must be BasicTransformType");
}
