import { mat4, Mat4, ReadonlyMat4 } from "../math/mat4";
import { quat } from "../math/quat";
import { ReadonlyVec3, vec3, Vec3 } from "../math/vec3";
import { assertIsNotNull } from "../type_utils";
import { GeometryFields } from "./geometry";

// copied from https://github.com/greggman/twgl.js/blob/master/src/primitives.js

function applyFuncToV3Array(
  this: void,
  array: number[],
  matrix: ReadonlyMat4,
  fn: (this: void, dst: Vec3, v: ReadonlyVec3, mi: ReadonlyMat4) => void
) {
  const len = array.length;
  const tmp: Vec3 = [0, 0, 0];
  for (let ii = 0; ii < len; ii += 3) {
    fn(tmp, [array[ii], array[ii + 1], array[ii + 2]], matrix);
    array[ii] = tmp[0];
    array[ii + 1] = tmp[1];
    array[ii + 2] = tmp[2];
  }
}

function transformNormal(
  this: void,
  dst: Vec3,
  v: ReadonlyVec3,
  mi: ReadonlyMat4
) {
  dst = dst || vec3.create();
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];

  dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
  dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
  dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

  return dst;
}

function reorientDirections(this: void, array: number[], matrix: ReadonlyMat4) {
  applyFuncToV3Array(
    array,
    mat4.fromQuat(mat4.create(), mat4.getRotation(quat.create(), matrix)),
    function (...args) {
      return vec3.transformMat4(...args);
    }
  );
  return array;
}

function reorientNormals(this: void, array: number[], matrix: ReadonlyMat4) {
  const invert = mat4.invert(mat4.create(), matrix);
  assertIsNotNull(invert);
  applyFuncToV3Array(array, invert, transformNormal);
  return array;
}

function reorientPositions(this: void, array: number[], matrix: ReadonlyMat4) {
  applyFuncToV3Array(array, matrix, function (...args) {
    return vec3.transformMat4(...args);
  });
  return array;
}

function reorientVertices<T extends Record<string, number[]>>(
  this: void,
  arrays: T,
  matrix: ReadonlyMat4
) {
  Object.keys(arrays).forEach(function (name) {
    const array = arrays[name];
    if (name.indexOf("pos") >= 0) {
      reorientPositions(array, matrix);
    } else if (name.indexOf("tan") >= 0 || name.indexOf("binorm") >= 0) {
      reorientDirections(array, matrix);
    } else if (name.indexOf("norm") >= 0) {
      reorientNormals(array, matrix);
    }
  });
  return arrays;
}

export function createPlaneVertices(
  this: void,
  width?: number,
  depth?: number,
  subdivisionsWidth?: number,
  subdivisionsDepth?: number,
  matrix?: Mat4
) {
  width = width ?? 1;
  depth = depth ?? 1;
  subdivisionsWidth = subdivisionsWidth ?? 1;
  subdivisionsDepth = subdivisionsDepth ?? 1;
  matrix = matrix ?? mat4.identity(mat4.create());

  const positions: number[] = [];
  const normals: number[] = [];
  const texcoords: number[] = [];
  const colors: number[] = [];

  for (let z = 0; z <= subdivisionsDepth; z++) {
    for (let x = 0; x <= subdivisionsWidth; x++) {
      const u = x / subdivisionsWidth;
      const v = z / subdivisionsDepth;
      positions.push(width * u - width * 0.5, 0, depth * v - depth * 0.5);
      normals.push(0, 1, 0);
      texcoords.push(u, v);
      colors.push(1, 1, 1, 1);
    }
  }

  const numVertsAcross = subdivisionsWidth + 1;
  const indices: number[] = [];

  for (let z = 0; z < subdivisionsDepth; z++) {
    // eslint-disable-line
    for (let x = 0; x < subdivisionsWidth; x++) {
      // eslint-disable-line
      // Make triangle 1 of quad.
      indices.push(
        (z + 0) * numVertsAcross + x,
        (z + 1) * numVertsAcross + x,
        (z + 0) * numVertsAcross + x + 1
      );

      // Make triangle 2 of quad.
      indices.push(
        (z + 1) * numVertsAcross + x,
        (z + 1) * numVertsAcross + x + 1,
        (z + 0) * numVertsAcross + x + 1
      );
    }
  }

  const arrays: Record<Exclude<keyof GeometryFields, "id">, number[]> = {
    colors: colors,
    indices: indices,
    positions: positions,
    uv0s: texcoords,
    normals: normals,
  };

  return reorientVertices(arrays, matrix);
}
