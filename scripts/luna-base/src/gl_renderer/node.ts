import * as _gl from "gl";
import { F32Mat4 } from "../buffers/f32array";
import { inspect } from "../lib/inspect/inspect";
import { Mat4 } from "../math/mat4";
import { allocTableName, createTable, TableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { uuid } from "../uuid";
import { Image } from "./image";
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

export interface CommandState<T extends any = any> {
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
  task: Omit<T, "id">
) {
  const fields = {
    id: uuid.v4() as NodeTaskId,
  };
  return createTable(SCRIPT_TASK_TABLE_NAME, { ...fields, ...task });
}

export type NodeId = string & { __node: never };

export interface NodeField {
  readonly id: NodeId;
  readonly name: string;
  enabled: boolean;
  children: Node[];
  tasks: NodeTask[];
}

type Errors = any[];
type RunTaskResult<T> = [CommandState<T>, Errors];
export interface NodePrototype<U = any> {
  runTask(
    this: Node,
    command: Command,
    state: CommandState<U>
  ): CommandState<U>;
  start(this: Node, state: CommandState<U>, errors?: Errors): RunTaskResult<U>;
  load(this: Node, state: CommandState<U>, errors?: Errors): RunTaskResult<U>;
  update(this: Node, state: CommandState<U>, errors?: Errors): RunTaskResult<U>;
  transform(
    this: Node,
    state: CommandState<U>,
    world: Mat4,
    errors?: Errors
  ): RunTaskResult<U>;
  render(this: Node, state: CommandState<U>, errors?: Errors): RunTaskResult<U>;
  addChild(this: Node, node: Node): Node;
  addTask(this: Node, task: NodeTask): void;
  findTasks(
    this: Node,
    fn: (this: void, task: NodeTask) => boolean
  ): NodeTask[];
  findTransform(this: Node): Transform | null;
  traverse(
    this: Node,
    enter: (this: void, node: Node) => void | boolean,
    leave?: (this: void, node: Node) => void
  ): void;
  flat(this: Node): Node[];
}

export type Node = NodePrototype & NodeField;

const prototype: NodePrototype = {
  runTask: function (command, state) {
    for (const task of this.tasks) {
      state = task.run(command, state);
    }
    return state;
  },
  start: function (state, errors = []) {
    if (!this.enabled) {
      return [state, errors];
    }

    const node = this;
    try {
      state = this.runTask({ name: "start", node }, state);
    } catch (e) {
      errors.push(e);
    }

    for (const node of this.children) {
      [state, errors] = node.start(state, errors);
    }
    return [state, errors];
  },
  load: function (state, errors = []) {
    if (!this.enabled) {
      return [state, errors];
    }

    try {
      state = this.runTask({ name: "load", node: this }, state);
    } catch (e) {
      errors.push(e);
    }

    for (const node of this.children) {
      [state, errors] = node.load(state, errors);
    }

    return [state, errors];
  },
  update: function (state, errors = []) {
    if (!this.enabled) {
      return [state, errors];
    }

    try {
      state = this.runTask({ name: "update", node: this }, state);
    } catch (e) {
      errors.push(e);
    }

    for (const node of this.children) {
      [state, errors] = node.update(state, errors);
    }

    return [state, errors];
  },
  transform(state, world, errors = []) {
    if (!this.enabled) {
      return [state, errors];
    }
    try {
      state = this.runTask({ name: "transform", node: this, world }, state);
    } catch (e) {
      errors.push(e);
    }
    const updatedWorld = state.worlds[this.id];
    assertIsNotNull(updatedWorld);
    for (const node of this.children) {
      [state, errors] = node.transform(state, updatedWorld);
    }
    return [state, errors];
  },
  render: function (state, errors = []) {
    if (!this.enabled) {
      return [state, errors];
    }

    try {
      state = this.runTask({ name: "prerender", node: this }, state);
    } catch (e) {
      errors.push(e);
    }

    for (const node of this.children) {
      [state, errors] = node.render(state);
    }

    try {
      state = this.runTask({ name: "render", node: this }, state);
    } catch (e) {
      errors.push(e);
    }
    return [state, errors];
  },
  addChild: function (node) {
    this.children.push(node);
    return node;
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
  traverse: function (enter, leave) {
    if (enter(this) !== false) {
      for (const node of this.children) {
        node.traverse(enter);
      }
    }
    leave?.(this);
  },
  flat: function () {
    const tasks: Node[] = [];
    this.traverse(function (node) {
      tasks.push(node);
    });
    return tasks;
  },
};

export function createNode<T = any>(
  this: void,
  { tasks, children, name, enabled }: Partial<Omit<NodeField, "id">> = {}
): NodePrototype<T> & NodeField {
  const fields: NodeField = {
    id: uuid.v4() as NodeId,
    name: name ?? "Node",
    enabled: enabled ?? true,
    children: [],
    tasks: [],
  };
  const node = createTable(TABLE_NAME, fields, prototype);
  node.addTask(createTransformTask(createTransform()));

  if (tasks != null) {
    for (const task of tasks) {
      node.addTask(task);
    }
  }

  if (children != null) {
    for (const child of children) {
      node.addChild(child);
    }
  }

  return node;
}
