import * as _gl from "gl";
import { F32Mat4 } from "../buffers/f32array";
import { Mat4 } from "../math/mat4";
import { allocTableName, createTable, TableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { uuid } from "../uuid";
import { Image, ImageId } from "./image";
import { createTransform, Transform } from "./transform";
import { createTransformTask, isTransformTask } from "./transform_task";

const TABLE_NAME = allocTableName("LUA_TYPE_NODE");
const SCRIPT_TASK_TABLE_NAME = allocTableName("LUA_TYPE_SCRIPT_TASK");

interface CommandInterface {
  name: string;
  node: Node;
}

interface StartCommand extends CommandInterface {
  name: "start";
}

interface LoadCommand extends CommandInterface {
  name: "load";
}

interface UpdateCommand extends CommandInterface {
  name: "update";
}

interface TransformCommand extends CommandInterface {
  name: "transform";
  world: Mat4;
}

interface PreRenderCommand extends CommandInterface {
  name: "prerender";
}

interface RenderCommand extends CommandInterface {
  name: "render";
}

export interface CommandState<T extends any = null> {
  worlds: Record<NodeId, F32Mat4 | undefined>;
  images: Record<NodeId, Image | undefined>;
  userdata: T;
}

export function initCommandState<U>(userdata: U): CommandState<U> {
  return { images: {}, worlds: {}, userdata };
}

export type Command =
  | StartCommand
  | UpdateCommand
  | LoadCommand
  | TransformCommand
  | PreRenderCommand
  | RenderCommand;

export type NodeTaskId = string & { __node_task: never };

export interface NodeTaskField {
  readonly id: NodeTaskId;
}

export interface NodeTaskPrototype<T extends NodeTask = NodeTask, U = any> {
  run(this: T, command: Command, state: CommandState<U>): CommandState<U>;
}

export type NodeTask = NodeTaskField & NodeTaskPrototype;

export function createTask<T extends TableName, N extends NodeTask = NodeTask>(
  this: void,
  tableName: T,
  prototype: N
) {
  const fields: NodeTaskField = {
    id: uuid.v4() as NodeTaskId,
  };
  return createTable(tableName, fields, prototype);
}

export function createScriptTask<T extends NodeTask = NodeTask>(
  this: void,
  task: Omit<T, "id"> & { id?: T["id"] }
) {
  const fields = {
    id: uuid.v4() as NodeTaskId,
  };
  return createTable(SCRIPT_TASK_TABLE_NAME, { ...fields, ...task });
}

export type NodeId = string & { __node: never };

export interface NodeFields {
  id: NodeId;
  enabled: boolean;
  children: Node[];
  tasks: NodeTask[];
}

export interface NodePrototype {
  runTask(this: Node, command: Command, state: CommandState): CommandState;
  start(this: Node, state: CommandState): CommandState;
  load(this: Node, state: CommandState): CommandState;
  update(this: Node, state: CommandState): CommandState;
  transform(this: Node, state: CommandState, world: Mat4): CommandState;
  render(this: Node, state: CommandState): CommandState;
  addChild(this: Node, node: Node): void;
  addTask(this: Node, task: NodeTask): void;
  findTasks(
    this: Node,
    fn: (this: void, task: NodeTask) => boolean
  ): NodeTask[];
  findTransform(this: Node): Transform | null;
  traverse(this: Node, fn: (this: void, node: Node) => void | boolean): void;
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
  start: function (state) {
    if (!this.enabled) {
      return state;
    }

    const node = this;
    state = this.runTask({ name: "start", node }, state);
    for (const node of this.children) {
      state = node.start(state);
    }
    return state;
  },
  load: function (state) {
    if (!this.enabled) {
      return state;
    }

    state = this.runTask({ name: "load", node: this }, state);
    for (const node of this.children) {
      state = node.load(state);
    }
    return state;
  },
  update: function (state) {
    if (!this.enabled) {
      return state;
    }

    state = this.runTask({ name: "update", node: this }, state);
    for (const node of this.children) {
      state = node.update(state);
    }
    return state;
  },
  transform(state, world) {
    if (!this.enabled) {
      return state;
    }
    state = this.runTask({ name: "transform", node: this, world }, state);
    const updatedWorld = state.worlds[this.id];
    assertIsNotNull(updatedWorld);
    for (const node of this.children) {
      state = node.transform(state, updatedWorld);
    }
    return state;
  },
  render: function (state) {
    if (!this.enabled) {
      return state;
    }

    state = this.runTask({ name: "prerender", node: this }, state);
    for (const node of this.children) {
      state = node.render(state);
    }
    state = this.runTask({ name: "render", node: this }, state);
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
  traverse: function (fn) {
    if (fn(this) === false) {
      return;
    }

    for (const node of this.children) {
      node.traverse(fn);
    }
  },
  flat: function () {
    const tasks: Node[] = [];
    this.traverse(function (node) {
      tasks.push(node);
    });
    return tasks;
  },
};

export function createNode(
  this: void,
  { tasks, children }: Partial<Omit<NodeFields, "id">> = {}
): Node {
  const fields: NodeFields = {
    id: uuid.v4() as NodeId,
    enabled: true,
    children: children ?? [],
    tasks: tasks ?? [],
  };
  const node = createTable(TABLE_NAME, fields, prototype);
  node.addTask(createTransformTask(createTransform()));
  return node;
}
