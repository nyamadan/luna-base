import mat4, { Mat4 } from "../../math/mat4";
import { ReadonlyVec3 } from "../../math/vec3";
import { allocTableName, createTable, getMetatableName } from "../../tables";
import { TransformFields, TransformPrototype } from "./transform";

const TABLE_NAME = allocTableName("LUA_TYPE_PERSPECTIVE_CAMERA_TRANSFORM");

interface PerspectiveCameraTransformFields extends TransformFields {
  view: Mat4;
  proj: Mat4;

  fovy: number;
  aspect: number;
  near: number;
  far: number;
}

interface PerspectiveCameraTransformPrototype extends TransformPrototype {
  update(this: PerspectiveCameraTransformType): void;
  lookAt(
    this: PerspectiveCameraTransformType,
    eye: ReadonlyVec3,
    center: ReadonlyVec3,
    up: ReadonlyVec3
  ): void;
}

export interface PerspectiveCameraTransformType
  extends PerspectiveCameraTransformFields,
    PerspectiveCameraTransformPrototype {}

const prototype: PerspectiveCameraTransformPrototype = {
  update() {
    mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far);

    mat4.mul(this.matrix, this.proj, this.view);
  },
  lookAt(eye, center, up) {
    mat4.lookAt(this.view, eye, center, up);
  },
};

export function createPerspectiveCameraTransform(
  this: void,
  params: Partial<
    Omit<PerspectiveCameraTransformFields, "matrix" | "proj" | "view">
  > = {}
): PerspectiveCameraTransformType {
  const fields: PerspectiveCameraTransformFields = {
    matrix: mat4.create(),
    view: mat4.create(),
    proj: mat4.create(),
    near: params.near ?? 0.1,
    far: params.far ?? 1000.0,
    fovy: params.aspect ?? 0.5 * math.pi,
    aspect: params.aspect ?? 1.0,
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isPerspectiveCameraTransform(
  this: void,
  x: unknown
): x is PerspectiveCameraTransformType {
  return getMetatableName(x) === TABLE_NAME;
}

export function assertPerspectiveCameraTransform(
  this: void,
  x: unknown,
  message?: string
): asserts x is PerspectiveCameraTransformType {
  assert(
    isPerspectiveCameraTransform(x),
    message ?? "value must be PerspectiveCameraTransformType"
  );
}
