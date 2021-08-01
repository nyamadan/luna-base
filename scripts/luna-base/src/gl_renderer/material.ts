import * as _gl from "gl";
import { uuid } from "../uuid";
import { Texture } from "./texture";

interface MaterialFields {
  id: string;
  program: {
    name: string;
  };
  texture: Texture | null;
}

interface MaterialPrototype {}

export type Material = MaterialPrototype & MaterialFields;

const materialPrototype: MaterialPrototype = {};

const imageMetatable = {
  __index: materialPrototype,
  __name: "LUA_TYPE_MATERIAL",
  __gc: function (this: Material) {},
};

export function createMaterial(
  this: void,
  programName: string,
  texture?: Texture
): Material {
  const fields: MaterialFields = {
    id: uuid.v4(),
    program: { name: programName },
    texture: texture ?? null,
  };
  const o = setmetatable(fields, imageMetatable) as Material;
  return o;
}
