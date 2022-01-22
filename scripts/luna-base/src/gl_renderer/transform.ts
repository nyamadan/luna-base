import { Mat4 } from "../math/mat4";

export interface TransformFields {
  matrix: Mat4;
}

export interface TransformPrototype {
  update(): void;
}

export interface TransformType extends TransformFields, TransformPrototype {}
