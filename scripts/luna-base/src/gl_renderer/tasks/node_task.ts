import { createF32Mat4, F32Mat4 } from "../../buffers/f32array";
import { logger } from "../../logger";
import mat4, { Mat4 } from "../../math/mat4";
import { createTable, TableName } from "../../tables";
import { uuid } from "../../uuid";
import { GeometryType } from "../geometry";
import { Image } from "../image";
import { createBasicTransform } from "../transforms/basic_transform";
import { TransformType } from "../transforms/transform";
import { InputEvent } from "./application_event";

interface CommandInterface {
  name: string;
  node: NodeTaskType;
  source: NodeTaskType;
}

interface SetupCommand extends CommandInterface {
  name: "setup";
}

interface InputCommand extends CommandInterface {
  name: "input";
  inputEvents: ReadonlyArray<InputEvent>;
}

interface UpdateCommand extends CommandInterface {
  name: "update";
}

interface UpdateWorldCommand extends CommandInterface {
  name: "update-world";
  parent: Mat4;
}

interface PreRenderCommand extends CommandInterface {
  name: "prerender";
}

interface RenderCommand extends CommandInterface {
  name: "render";
}

export type Command =
  | InputCommand
  | PreRenderCommand
  | RenderCommand
  | SetupCommand
  | UpdateCommand
  | UpdateWorldCommand;

interface KeyState {
  state: Record<string, "DOWN" | "UP" | undefined>;
}

interface MouseState {
  state: Record<string, "DOWN" | "UP" | undefined>;
  x: number;
  y: number;
}
export interface CommandState {
  worlds: Record<NodeTaskId, F32Mat4 | undefined>;
  images: Record<NodeTaskId, Image | undefined>;
  geometries: Record<NodeTaskId, GeometryType | undefined>;
  keys: KeyState;
  mouse: MouseState;
  userdata: any;
}

export function initCommandState(this: void, userdata: any): CommandState {
  return {
    images: {},
    worlds: {},
    geometries: {},
    keys: { state: {} },
    mouse: { state: {}, x: 0, y: 0 },
    userdata,
  };
}

type RunTaskResult = CommandState;

const nodeTaskPrototype: Readonly<Omit<NodeTaskPrototype, "run">> = {
  runCommand(command, state) {
    if (this.enabled) {
      for (const task of this.tasks) {
        state = task.runCommand(command, state);
      }
      state = this.run(command, state);
    }
    return state;
  },
  updateRefs() {
    this.traverse((task) => {
      if (task.ref != null) {
        task.ref.task = task;
      }
    });
  },
  setup(state) {
    this.traverse(
      (task) => {
        return task.enabled;
      },
      (node) => {
        const [ok, err] = xpcall(() => {
          state = node.runCommand({ name: "setup", source: this, node }, state);
        }, debug.traceback);

        if (!ok) {
          logger.error("%s", err);
        }
      }
    );
    return state;
  },
  input(state, inputEvents) {
    this.traverse((node) => {
      if (!node.enabled) {
        return false;
      }

      const [ok, err] = xpcall(() => {
        state = node.runCommand(
          { name: "input", source: this, node, inputEvents },
          state
        );
      }, debug.traceback);

      if (!ok) {
        logger.error("%s", err);
      }
    });
    return state;
  },
  update(state) {
    this.traverse((node) => {
      if (!node.enabled) {
        return false;
      }

      const [ok, err] = xpcall(() => {
        state = node.runCommand({ name: "update", source: this, node }, state);
      }, debug.traceback);

      if (!ok) {
        logger.error("%s", err);
      }
    });
    return state;
  },
  updateWorld(state, parent) {
    const updateWorldRecursive = (
      state: CommandState,
      parent: Mat4,
      node: NodeTaskType
    ): CommandState => {
      if (!node.enabled) {
        return state;
      }

      const [ok, err] = xpcall(() => {
        state = node.runCommand(
          { name: "update-world", source: this, node, parent },
          state
        );
      }, debug.traceback);

      if (!ok) {
        logger.error("%s", err);
      }

      const worlds = { ...state.worlds };
      const world = (worlds[node.guid] ??= createF32Mat4());
      node.transform.update();
      mat4.mul(world, parent, node.transform.matrix);
      state = { ...state, worlds };

      for (const child of node.children) {
        state = updateWorldRecursive(state, world, child);
      }

      return state;
    };

    return updateWorldRecursive(state, parent, this);
  },
  render(state) {
    this.traverse(
      (node) => {
        if (!node.enabled) {
          return false;
        }

        const [ok, err] = xpcall(() => {
          state = node.runCommand(
            { name: "prerender", source: this, node },
            state
          );
        }, debug.traceback);

        if (!ok) {
          logger.error("%s", err);
        }
      },
      (node) => {
        const [ok, err] = xpcall(() => {
          state = node.runCommand(
            { name: "render", source: this, node },
            state
          );
        }, debug.traceback);

        if (!ok) {
          logger.error("%s", err);
        }
      }
    );
    return state;
  },
  addChild(task) {
    this.children.push(task);
  },
  findTasks<S extends NodeTaskType>(
    this: NodeTaskType,
    f:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S),
    maxDepth?: number
  ) {
    maxDepth = maxDepth ?? 0xffffffff;
    assert(maxDepth >= 0, "maxDepth >= 0");

    const results: S[] = [];

    if (f(this)) {
      results.push(this);
    }

    for (const task of this.tasks) {
      if (f(task)) {
        results.push(task);
      }
    }

    if (maxDepth > 0) {
      for (const task of this.children) {
        results.push(...task.findTasks(f, maxDepth - 1));
      }
    }
    return results;
  },
  findTasksInChildren<S extends NodeTaskType>(
    this: NodeTaskType,
    f:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S)
  ) {
    const results: S[] = [];
    for (const child of this.children) {
      results.push(...child.findTasks(f, 0));
    }
    return results;
  },
  findTask<S extends NodeTaskType>(
    this: NodeTaskType,
    f:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S),
    maxDepth?: number
  ) {
    maxDepth = maxDepth ?? 0xffffffff;
    assert(maxDepth >= 0, "maxDepth >= 0");

    if (f(this)) {
      return this;
    }

    for (const task of this.tasks) {
      if (f(task)) {
        return task;
      }
    }

    if (maxDepth > 0) {
      for (const child of this.children) {
        const task = child.findTask(f, maxDepth - 1);
        if (task != null) {
          return task;
        }
      }
    }

    return null;
  },
  findTaskInChildren<S extends NodeTaskType>(
    this: NodeTaskType,
    f:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S)
  ) {
    for (const child of this.children) {
      const task = child.findTask(f, 0);
      if (task != null) {
        return task;
      }
    }
    return null;
  },
  traverse(enter, leave) {
    function t(
      this: void,
      task: NodeTaskType,
      parent: NodeTaskType | null,
      ...[enter, leave]: Parameters<NodeTaskType["traverse"]>
    ) {
      if (enter(task, parent) !== false) {
        for (const child of task.children) {
          t(child, task, enter, leave);
        }
      }
      leave?.(task, parent);
    }

    t(this, null, enter, leave);
  },
  flat() {
    const tasks: NodeTaskType[] = [];
    this.traverse(function (task) {
      tasks.push(task);
    });
    return tasks;
  },
};

export function createNodeTaskPrototype<T extends NodeTaskType = NodeTaskType>(
  params: Partial<Omit<T, keyof NodeTaskRunner<T>>> &
    Pick<T, keyof NodeTaskRunner<T>>
): NodeTaskPrototype<T> {
  return createTable("LUA_TYPE_NODE_TASK", params, nodeTaskPrototype);
}

export type NodeTaskId = string & { __task_task: never };

export interface TaskRef<T extends NodeTaskType = NodeTaskType> {
  task: T | null;
}

export function createTaskRef<T extends NodeTaskType = NodeTaskType>(
  task?: T | null
): TaskRef<T> {
  return {
    task: task ?? null,
  };
}

export interface NodeTaskField<
  Id extends NodeTaskId = NodeTaskId,
  T extends NodeTaskType = NodeTaskType
> {
  readonly guid: Id;
  readonly isTask: true;
  name: string;
  enabled: boolean;
  tags: string[];
  transform: TransformType;
  children: NodeTaskType[];
  tasks: NodeTaskType[];
  ref: TaskRef<T> | null;
}

export interface NodeTaskRunner<T extends NodeTaskType = NodeTaskType> {
  run(this: T, command: Command, state: CommandState): CommandState;
}

export interface NodeTaskPrototype<T extends NodeTaskType = NodeTaskType>
  extends NodeTaskRunner<T> {
  runCommand(
    this: NodeTaskType,
    command: Command,
    state: CommandState
  ): CommandState;
  updateRefs(this: NodeTaskType): void;
  setup(this: NodeTaskType, state: CommandState): RunTaskResult;
  input(
    this: NodeTaskType,
    state: CommandState,
    inputEvents: ReadonlyArray<InputEvent>
  ): RunTaskResult;
  update(this: NodeTaskType, state: CommandState): RunTaskResult;
  updateWorld(
    this: NodeTaskType,
    state: CommandState,
    parent: Mat4
  ): RunTaskResult;
  render(this: NodeTaskType, state: CommandState): RunTaskResult;
  addChild(this: NodeTaskType, task: NodeTaskType): void;
  findTasks<S extends NodeTaskType>(
    this: NodeTaskType,
    fn:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S),
    maxDepth?: number
  ): S[];
  findTasksInChildren<S extends NodeTaskType>(
    this: NodeTaskType,
    fn:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S)
  ): S[];
  findTask<S extends NodeTaskType>(
    this: NodeTaskType,
    fn:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S),
    maxDepth?: number
  ): S | null;
  findTaskInChildren<S extends NodeTaskType>(
    this: NodeTaskType,
    fn:
      | ((this: void, task: NodeTaskType) => boolean)
      | ((this: void, task: NodeTaskType) => task is S)
  ): S | null;
  traverse(
    this: NodeTaskType,
    enter: (
      this: void,
      task: NodeTaskType,
      parent: NodeTaskType | null
    ) => boolean | void,
    leave?: (
      this: void,
      task: NodeTaskType,
      parent: NodeTaskType | null
    ) => void
  ): void;
  flat(this: NodeTaskType): NodeTaskType[];
}

export interface NodeTaskType extends NodeTaskField, NodeTaskPrototype {}

type NodeTaskTypeOptionalField =
  | "children"
  | "enabled"
  | "name"
  | "ref"
  | "tags"
  | "tasks"
  | "transform";

type NodeTaskTypeAutoField = "guid" | "isTask";

export type NodeTaskProps<
  T extends NodeTaskField,
  M extends keyof Omit<T, keyof NodeTaskField>,
  O extends keyof Omit<T, keyof NodeTaskField>
> = Partial<Pick<Omit<T, keyof NodeTaskField>, O>> &
  Partial<Pick<T, NodeTaskTypeOptionalField>> &
  Pick<Omit<T, keyof NodeTaskField>, M>;

type Undefinable<T> = {
  [P in keyof T]: T[P] | undefined;
};

export function pickOptionalField(
  this: void,
  params?: Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>>
): Undefinable<Pick<NodeTaskField, NodeTaskTypeOptionalField>> {
  return {
    children: params?.children,
    enabled: params?.enabled,
    name: params?.name,
    ref: params?.ref,
    tags: params?.tags,
    tasks: params?.tasks,
    transform: params?.transform,
  };
}

export function createTask<
  T extends TableName,
  T1 extends Omit<
    NodeTaskField,
    NodeTaskTypeAutoField | NodeTaskTypeOptionalField
  > &
    Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>>,
  T2 extends NodeTaskPrototype
>(this: void, tableName: T | null, fields: T1 | null, prototype: T2) {
  const initial: Pick<
    NodeTaskField,
    NodeTaskTypeAutoField | NodeTaskTypeOptionalField
  > = {
    guid: uuid.v4() as NodeTaskId,
    name: tableName ?? "TASK",
    transform: fields?.transform ?? createBasicTransform(),
    enabled: true,
    isTask: true,
    tags: [],
    children: [],
    tasks: [],
    ref: null,
  };

  return createTable(
    tableName,
    { ...initial, ...fields } as T1 & typeof initial,
    prototype as T2
  ) as T1 & T2 & typeof initial;
}

export function isNodeTask(this: void, x: unknown): x is NodeTaskType {
  return (x as any)?.isTask === true;
}

export default function NodeTask(
  this: void,
  {
    task,
  }: {
    task: NodeTaskType;
  }
) {
  return task;
}
