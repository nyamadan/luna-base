import mat4, { Mat4 } from "../../math/mat4";
import { ReadonlyVec3 } from "../../math/vec3";
import { allocTableName, createTable, getMetatableName } from "../../tables";
import { TransformFields, TransformPrototype } from "./transform";

const TABLE_NAME = allocTableName("LUA_TYPE_ORTHO_CAMERA_TRANSFORM");

interface OrthoCameraTransformFields extends TransformFields {
  view: Mat4;
  proj: Mat4;

  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}

interface OrthoCameraTransformPrototype extends TransformPrototype {
  update(this: OrthoCameraTransformType): void;
  lookAt(
    this: OrthoCameraTransformType,
    eye: ReadonlyVec3,
    center: ReadonlyVec3,
    up: ReadonlyVec3
  ): void;
}

export interface OrthoCameraTransformType
  extends OrthoCameraTransformFields,
    OrthoCameraTransformPrototype {}

const prototype: OrthoCameraTransformPrototype = {
  update() {
    mat4.ortho(
      this.proj,
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far
    );

    mat4.mul(this.matrix, this.proj, this.view);
  },
  lookAt(eye, center, up) {
    mat4.lookAt(this.view, eye, center, up);
  },
};

export function createOrthoCameraTransform(
  this: void,
  params: Partial<
    Omit<OrthoCameraTransformFields, "matrix" | "proj" | "view">
  > = {}
): OrthoCameraTransformType {
  const fields: OrthoCameraTransformFields = {
    matrix: mat4.create(),
    view: mat4.create(),
    proj: mat4.create(),
    bottom: params.bottom ?? -0.5,
    top: params.top ?? 0.5,
    left: params.left ?? -0.5,
    right: params.right ?? 0.5,
    near: params.near ?? 0.1,
    far: params.far ?? 1000.0,
  };
  return createTable(TABLE_NAME, fields, prototype);
}

export function isOrthoCameraTransform(
  this: void,
  x: unknown
): x is OrthoCameraTransformType {
  return getMetatableName(x) === TABLE_NAME;
}

export function assertOrthoCameraTransform(
  this: void,
  x: unknown,
  message?: string
): asserts x is OrthoCameraTransformType {
  assert(
    isOrthoCameraTransform(x),
    message ?? "value must be OrthoCameraTransformType"
  );
}
