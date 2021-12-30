import * as _gl from "gl";
import { F32Mat4 } from "../buffers/f32array";
import { inspect } from "../lib/inspect/inspect";
import { logger } from "../logger";
import { Mat4 } from "../math/mat4";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { uuid } from "../uuid";
import { Image } from "./image";
import { NodeTask } from "./node_task";
import { createTransform, Transform } from "./transform";
import { createTransformTask, isTransformTask } from "./transform_task";

const TABLE_NAME = allocTableName("LUA_TYPE_NODE");

interface CommandInterface {
  name: string;
  node: NodeType;
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

export type Command =
  | StartCommand
  | UpdateCommand
  | LoadCommand
  | TransformCommand
  | PreRenderCommand
  | RenderCommand;

export interface CommandState<T extends any = any> {
  worlds: Record<NodeId, F32Mat4 | undefined>;
  images: Record<NodeId, Image | undefined>;
  userdata: T;
}

export function initCommandState<U>(userdata: U): CommandState<U> {
  return { images: {}, worlds: {}, userdata };
}

export type NodeId = string & { __node: never };

export interface NodeField {
  readonly id: NodeId;
  readonly name: string;
  enabled: boolean;
  children: NodeType[];
  tasks: NodeTask[];
}

type RunTaskResult<T> = CommandState<T>;
export interface NodePrototype<U = any> {
  runTask(
    this: NodeType,
    command: Command,
    state: CommandState<U>
  ): CommandState<U>;
  start(this: NodeType, state: CommandState<U>): RunTaskResult<U>;
  load(this: NodeType, state: CommandState<U>): RunTaskResult<U>;
  update(this: NodeType, state: CommandState<U>): RunTaskResult<U>;
  transform(
    this: NodeType,
    state: CommandState<U>,
    world: Mat4
  ): RunTaskResult<U>;
  render(this: NodeType, state: CommandState<U>): RunTaskResult<U>;
  addChild(this: NodeType, node: NodeType): NodeType;
  addTask(this: NodeType, task: NodeTask): void;
  findTasks(
    this: NodeType,
    fn: (this: void, task: NodeTask) => boolean
  ): NodeTask[];
  findTransform(this: NodeType): Transform | null;
  traverse(
    this: NodeType,
    enter: (this: void, node: NodeType) => void | boolean,
    leave?: (this: void, node: NodeType) => void
  ): void;
  flat(this: NodeType): NodeType[];
}

export type NodeType = NodePrototype & NodeField;

const prototype: NodePrototype = {
  runTask: function (command, state) {
    for (const task of this.tasks) {
      if (task.enabled) {
        state = task.run(command, state);
      }
    }
    return state;
  },
  start: function (state) {
    if (!this.enabled) {
      return state;
    }

    const node = this;
    try {
      state = this.runTask({ name: "start", node }, state);
    } catch (e) {
      logger.error("%s", inspect(e));
    }

    for (const node of this.children) {
      state = node.start(state);
    }
    return state;
  },
  load: function (state) {
    if (!this.enabled) {
      return state;
    }

    try {
      state = this.runTask({ name: "load", node: this }, state);
    } catch (e) {
      logger.error("%s", inspect(e));
    }

    for (const node of this.children) {
      state = node.load(state);
    }

    return state;
  },
  update: function (state) {
    if (!this.enabled) {
      return state;
    }

    try {
      state = this.runTask({ name: "update", node: this }, state);
    } catch (e) {
      logger.error("%s", inspect(e));
    }

    for (const node of this.children) {
      state = node.update(state);
    }

    return state;
  },
  transform(state, world) {
    if (!this.enabled) {
      return state;
    }
    try {
      state = this.runTask({ name: "transform", node: this, world }, state);
    } catch (e) {
      logger.error("%s", inspect(e));
    }
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

    try {
      state = this.runTask({ name: "prerender", node: this }, state);
    } catch (e) {
      logger.error("%s", inspect(e));
    }

    for (const node of this.children) {
      state = node.render(state);
    }

    try {
      state = this.runTask({ name: "render", node: this }, state);
    } catch (e) {
      logger.error("%s", inspect(e));
    }
    return state;
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
    const tasks: NodeType[] = [];
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

export function isNode(this: void, x: unknown): x is NodeType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function Node(
  this: void,
  {
    name,
    enabled,
    onCreate,
  }: Partial<{
    name: string;
    enabled: boolean;
    onCreate: (this: void, o: ReturnType<typeof createNode>) => void;
  }>
) {
  const node = createNode({ name, enabled });
  onCreate?.(node);
  return node;
}
