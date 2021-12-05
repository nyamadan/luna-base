import * as _gl from "gl";
import { F32Mat4 } from "../buffers/f32array";
import { Mat4 } from "../math/mat4";
import { assertIsNotNull } from "../type_utils";
import { uuid } from "../uuid";
import { Transform } from "./transform";
import { isTransformTask, TransformTask } from "./transform_task";

interface CommandInterface {
  name: string;
  node: Node;
}

interface UpdateCommand extends CommandInterface {
  name: "update";
  world: Mat4;
}

interface RenderCommand extends CommandInterface {
  name: "render";
}

export interface CommandState {
  worlds: Record<NodeId, F32Mat4 | undefined>;
}

export type Command = UpdateCommand | RenderCommand;

export type NodeTaskId = string & { __node_task: never };

export interface NodeTaskField {
  id: NodeTaskId;
}

export interface NodeTaskPrototype<T extends NodeTask = NodeTask> {
  run(this: T, command: Command, state: CommandState): CommandState;
}

export type NodeTask = NodeTaskField & NodeTaskPrototype;

export type NodeId = string & { __node: never };

interface NodeFields {
  id: NodeId;
  children: Node[];
  tasks: NodeTask[];
}

interface NodePrototype {
  runTask(this: Node, command: Command, state: CommandState): CommandState;
  update(this: Node, state: CommandState, world: Mat4): CommandState;
  addChild(this: Node, node: Node): void;
  addTask(this: Node, task: NodeTask): void;
  findTasks(
    this: Node,
    fn: (this: void, task: NodeTask) => boolean
  ): NodeTask[];
  findTransform(this: Node): Transform | null;
  forEach(this: Node, fn: (this: void, node: Node) => void): void;
  flat(this: Node): Node[];
}

export type Node = NodePrototype & NodeFields;

const prototype: NodePrototype = {
  runTask: function (command, state) {
    for (const task of this.tasks) {
      state = task.run(command, state);
    }
    return state;
  },
  update: function (state, world) {
    const node = this;
    state = this.runTask({ name: "update", node, world }, state);
    const updatedWorld = state.worlds[node.id];
    assertIsNotNull(updatedWorld);
    for (const node of this.children) {
      state = node.update(state, updatedWorld);
    }
    return state;
  },
  addChild: function (node) {
    this.children.push(node);
  },
  addTask: function (task) {
    this.tasks.push(task);
  },
  findTasks: function (f) {
    const results: NodeTask[] = [];
    for (const task of this.tasks) {
      if (f(task)) {
        results.push(task);
      }
    }
    return results;
  },
  findTransform: function () {
    for (const task of this.tasks) {
      if (isTransformTask(task)) {
        return task.transform;
      }
    }
    return null;
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
    id: uuid.v4() as NodeId,
    children: [],
    tasks: [],
  };
  const o = setmetatable(fields, metatable) as Node;
  return o;
}
