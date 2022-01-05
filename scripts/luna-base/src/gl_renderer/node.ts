import * as _gl from "gl";
import { F32Mat4 } from "../buffers/f32array";
import { logger } from "../logger";
import { Mat4 } from "../math/mat4";
import { allocTableName, createTable, getMetatableName } from "../tables";
import { assertIsNotNull } from "../type_utils";
import { uuid } from "../uuid";
import Node from "./components/node_component";
import { Geometry } from "./geometry";
import { Image } from "./image";
import { NodeTaskId, NodeTaskType } from "./node_task";
import { createTransform, Transform } from "./transform";
import {
  createTransformTask,
  isTransformTask,
  TransformTask,
} from "./transform_task";

const TABLE_NAME = allocTableName("LUA_TYPE_NODE");

interface CommandInterface {
  name: string;
  node: NodeType;
}

interface SetupCommand extends CommandInterface {
  name: "setup";
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
  | SetupCommand
  | UpdateCommand
  | TransformCommand
  | PreRenderCommand
  | RenderCommand;

export interface CommandState<T extends any = any> {
  worlds: Record<NodeId, F32Mat4 | undefined>;
  images: Record<NodeTaskId, Image | undefined>;
  geometries: Record<NodeTaskId, Geometry | undefined>;
  userdata: T;
}

export function initCommandState<U>(userdata: U): CommandState<U> {
  return { images: {}, worlds: {}, geometries: {}, userdata };
}

export type NodeId = string & { __node: never };

export interface NodeRef {
  node: NodeType | null;
}

export interface NodeField {
  readonly guid: NodeId;
  readonly name: string;
  enabled: boolean;
  children: NodeType[];
  tasks: NodeTaskType[];
  tags: string[];
  ref: NodeRef | null;
}

type RunTaskResult<T> = CommandState<T>;
export interface NodePrototype<U = any> {
  runTask(
    this: NodeType,
    command: Command,
    state: CommandState<U>
  ): CommandState<U>;
  updateRefs(this: NodeType): void;
  setup(this: NodeType, state: CommandState<U>): RunTaskResult<U>;
  update(this: NodeType, state: CommandState<U>): RunTaskResult<U>;
  transform(
    this: NodeType,
    state: CommandState<U>,
    world: Mat4
  ): RunTaskResult<U>;
  render(this: NodeType, state: CommandState<U>): RunTaskResult<U>;
  addChild(this: NodeType, node: NodeType): NodeType;
  addTask(this: NodeType, task: NodeTaskType): void;
  findTasks<S extends NodeTaskType>(
    this: NodeType,
    fn:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean),
    maxDepth?: number
  ): S[];
  findTasksInChildren<S extends NodeTaskType>(
    this: NodeType,
    fn:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean)
  ): S[];
  findTask<S extends NodeTaskType>(
    this: NodeType,
    fn:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean),
    maxDepth?: number
  ): S | null;
  findTaskInChildren<S extends NodeTaskType>(
    this: NodeType,
    fn:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean)
  ): S | null;
  findTransform(this: NodeType): Transform | null;
  traverse(
    this: NodeType,
    enter: (
      this: void,
      node: NodeType,
      parent: NodeType | null
    ) => void | boolean,
    leave?: (this: void, node: NodeType, parent: NodeType | null) => void
  ): void;
  flat(this: NodeType): NodeType[];
}

export type NodeType = NodePrototype & NodeField;

const prototype: NodePrototype = {
  runTask(command, state) {
    for (const task of this.tasks) {
      if (task.enabled) {
        state = task.run(command, state);
      }
    }
    return state;
  },
  updateRefs() {
    this.traverse((node) => {
      if (node.ref != null) {
        node.ref.node = node;
      }

      for (const task of node.tasks) {
        if (task.ref != null) {
          task.ref.node = node;
          task.ref.task = task;
        }
      }
    });
  },
  setup(state) {
    let ok: boolean;
    let err: unknown;

    if (!this.enabled) {
      return state;
    }

    for (const node of this.children) {
      state = node.setup(state);
    }

    [ok, err] = xpcall(() => {
      state = this.runTask({ name: "setup", node: this }, state);
    }, debug.traceback);
    if (!ok) {
      logger.error("%s", err);
    }

    return state;
  },
  update(state) {
    if (!this.enabled) {
      return state;
    }

    let ok: boolean;
    let err: unknown;

    [ok, err] = xpcall(() => {
      state = this.runTask({ name: "update", node: this }, state);
    }, debug.traceback);
    if (!ok) {
      logger.error("%s", err);
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

    let ok: boolean;
    let err: unknown;

    [ok, err] = xpcall(() => {
      state = this.runTask({ name: "transform", node: this, world }, state);
    }, debug.traceback);

    if (!ok) {
      logger.error("%s", err);
    }
    const updatedWorld = state.worlds[this.guid];
    assertIsNotNull(updatedWorld);
    for (const node of this.children) {
      state = node.transform(state, updatedWorld);
    }
    return state;
  },
  render(state) {
    if (!this.enabled) {
      return state;
    }

    let ok: boolean;
    let err: unknown;

    [ok, err] = xpcall(() => {
      state = this.runTask({ name: "prerender", node: this }, state);
    }, debug.traceback);

    if (!ok) {
      logger.error("%s", err);
    }

    for (const node of this.children) {
      state = node.render(state);
    }

    [ok, err] = xpcall(() => {
      state = this.runTask({ name: "render", node: this }, state);
    }, debug.traceback);

    if (!ok) {
      logger.error("%s", err);
    }
    return state;
  },
  addChild(node) {
    this.children.push(node);
    return node;
  },
  addTask(task) {
    this.tasks.push(task);
  },
  findTasks<S extends NodeTaskType>(
    this: NodeType,
    f:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean),
    maxDepth?: number
  ) {
    maxDepth = maxDepth ?? 0xffffffff;
    assert(maxDepth >= 0, "maxDepth >= 0");

    const results: S[] = [];

    for (const task of this.tasks) {
      if (f(task)) {
        results.push(task);
      }
    }

    if (maxDepth > 0) {
      for (const node of this.children) {
        results.push(...node.findTasks(f, maxDepth - 1));
      }
    }
    return results;
  },
  findTasksInChildren<S extends NodeTaskType>(
    this: NodeType,
    f:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean)
  ) {
    const results: S[] = [];
    for (const child of this.children) {
      results.push(...child.findTasks(f, 0));
    }
    return results;
  },
  findTask<S extends NodeTaskType>(
    this: NodeType,
    f:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean),
    maxDepth?: number
  ) {
    maxDepth = maxDepth ?? 0xffffffff;
    assert(maxDepth >= 0, "maxDepth >= 0");

    for (const task of this.tasks) {
      if (f(task)) {
        return task;
      }
    }

    if (maxDepth > 0) {
      for (const node of this.children) {
        const task = node.findTask(f, maxDepth - 1);
        if (task != null) {
          return task;
        }
      }
    }

    return null;
  },
  findTaskInChildren<S extends NodeTaskType>(
    this: NodeType,
    f:
      | ((this: void, task: NodeTaskType) => task is S)
      | ((this: void, task: NodeTaskType) => boolean)
  ) {
    for (const child of this.children) {
      const task = child.findTask(f, 0);
      if (task != null) {
        return task;
      }
    }
    return null;
  },
  findTransform() {
    return (
      this.findTask(function (task): task is TransformTask {
        return isTransformTask(task);
      }, 0)?.transform ?? null
    );
  },
  traverse(enter, leave) {
    function t(
      this: void,
      node: NodeType,
      parent: NodeType | null,
      ...[enter, leave]: Parameters<NodeType["traverse"]>
    ) {
      if (enter(node, parent) !== false) {
        for (const child of node.children) {
          t(child, node, enter, leave);
        }
      }
      leave?.(node, parent);
    }

    t(this, null, enter, leave);
  },
  flat() {
    const tasks: NodeType[] = [];
    this.traverse(function (node) {
      tasks.push(node);
    });
    return tasks;
  },
};

export function createNode<T = any>(
  this: void,
  {
    tasks,
    children,
    name,
    enabled,
    tags,
    ref,
  }: Partial<Omit<NodeField, "guid">> = {}
): NodePrototype<T> & NodeField {
  const fields: NodeField = {
    guid: uuid.v4() as NodeId,
    name: name ?? "NODE",
    enabled: enabled ?? true,
    tags: tags ?? [],
    ref: ref ?? null,
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
