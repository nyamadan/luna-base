import * as _gl from "gl";
import { F32Mat4 } from "../buffers/f32array";
import { Mat4 } from "../math/mat4";
import { allocTableName, createTable, TableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { uuid } from "../uuid";
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

interface UpdateCommand extends CommandInterface {
  name: "update";
  world: Mat4;
}

interface PreRenderCommand extends CommandInterface {
  name: "prerender";
}

interface RenderCommand extends CommandInterface {
  name: "render";
}

export interface CommandState {
  worlds: Record<NodeId, F32Mat4 | undefined>;
}

export type Command = StartCommand | UpdateCommand | PreRenderCommand | RenderCommand;

export type NodeTaskId = string & { __node_task: never };

export interface NodeTaskField {
  id: NodeTaskId;
}

export interface NodeTaskPrototype<T extends NodeTask = NodeTask> {
  run(this: T, command: Command, state: CommandState): CommandState;
}

export type NodeTask = NodeTaskField & NodeTaskPrototype;

export function createTask<T extends TableName, U extends NodeTask = NodeTask>(
  this: void,
  tableName: T,
  prototype: NodeTaskPrototype<U>
) {
  const fields: NodeTaskField = {
    id: uuid.v4() as NodeTaskId,
  };
  return createTable(tableName, fields, prototype);
}

export function createScriptTask<T extends NodeTask = NodeTask>(
  this: void,
  run: (this: T, command: Command, state: CommandState) => CommandState
) {
  const fields: NodeTaskField = {
    id: uuid.v4() as NodeTaskId,
  };
  const prototype: NodeTaskPrototype<T> = {
    run,
  };
  return createTable(SCRIPT_TASK_TABLE_NAME, fields, prototype);
}

export type NodeId = string & { __node: never };

interface NodeFields {
  id: NodeId;
  children: Node[];
  tasks: NodeTask[];
}

interface NodePrototype {
  runTask(this: Node, command: Command, state: CommandState): CommandState;
  start(this: Node, state: CommandState): CommandState;
  update(this: Node, state: CommandState, world: Mat4): CommandState;
  render(this: Node, state: CommandState): CommandState;
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
  start: function (state) {
    const node = this;
    state = this.runTask({ name: "start", node }, state);
    for (const node of this.children) {
      state = node.start(state);
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
  render: function (state) {
    const node = this;
    state = this.runTask({ name: "prerender", node }, state);
    for (const node of this.children) {
      state = node.render(state);
    }
    state = this.runTask({ name: "render", node }, state);
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

export function createNode(
  this: void,
  { tasks, children }: Partial<Omit<NodeFields, "id">> = {}
) {
  const fields: NodeFields = {
    id: uuid.v4() as NodeId,
    children: children ?? [],
    tasks: tasks ?? [],
  };
  const node = createTable(TABLE_NAME, fields, prototype);
  node.addTask(createTransformTask(createTransform()));
  return node;
}
