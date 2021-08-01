import * as _gl from "gl";
import { Mat4 } from "../math/mat4";
import { uuid } from "../uuid";
import { SubMesh } from "./sub_mesh";
import { createSubMeshTask } from "./sub_mesh_task";
import { createTransform, Transform } from "./transform";

interface CommandInterface {
  name: string;
}

interface UpdateCommand extends CommandInterface {
  name: "update";
}

interface RenderCommand extends CommandInterface {
  name: "render";
}

export type Command = UpdateCommand | RenderCommand;

export interface NodeTask {
  run: (this: void, command: Command) => void;
}

interface NodeFields {
  id: string;
  children: Node[];
  transform: Transform;
  tasks: NodeTask[];
}

interface NodePrototype {
  runTask(this: Node, command: Command): void;
  update(this: Node, world: Mat4): void;
  addChild(this: Node, node: Node): void;
  addTask(this: Node, task: NodeTask): void;
  addSubMesh(this: Node, subMesh: SubMesh): void;
  forEach(this: Node, fn: (this: void, node: Node) => void): void;
  flat(this: Node): Node[];
}

export type Node = NodePrototype & NodeFields;

const prototype: NodePrototype = {
  runTask: function (command) {
    for (const task of this.tasks) {
      task.run(command);
    }
  },
  update: function (world) {
    this.transform.update(world);
    for (const node of this.children) {
      node.update(this.transform.world);
      node.runTask({ name: "update" });
    }
  },
  addChild: function (node) {
    this.children.push(node);
  },
  addTask: function (task) {
    this.tasks.push(task);
  },
  addSubMesh: function (subMesh) {
    this.addTask(createSubMeshTask(subMesh));
  },
  forEach: function (fn) {
    fn(this);
    for (const node of this.children) {
      node.forEach(fn);
    }
  },
  flat: function () {
    const tasks: Node[] = [];
    this.forEach(function (node) {
      tasks.push(node);
    });
    return tasks;
  },
};

const metatable = {
  __index: prototype,
  __name: "LUA_TYPE_NODE",
  __gc: function (this: Node) {},
};

export function createNode(this: void) {
  const fields: NodeFields = {
    id: uuid.v4(),
    children: [],
    tasks: [],
    transform: createTransform(),
  };
  const o = setmetatable(fields, metatable) as Node;
  return o;
}
