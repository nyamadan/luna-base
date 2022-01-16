import { createF32Mat4, F32Mat4 } from "../buffers/f32array";
import { logger } from "../logger";
import mat4, { Mat4 } from "../math/mat4";
import { createTable, TableName } from "../tables";
import { uuid } from "../uuid";
import { Geometry } from "./geometry";
import { Image } from "./image";
import { createTransform, Transform } from "./transform";

interface CommandInterface {
  name: string;
  task: NodeTaskType;
}

interface SetupCommand extends CommandInterface {
  name: "setup";
}

interface UpdateCommand extends CommandInterface {
  name: "update";
}

interface UpdateWorldCommand extends CommandInterface {
  name: "update-world";
  world: Mat4;
}

interface PreRenderCommand extends CommandInterface {
  name: "prerender";
}

interface RenderCommand extends CommandInterface {
  name: "render";
}

export type Command =
  | PreRenderCommand
  | RenderCommand
  | SetupCommand
  | UpdateCommand
  | UpdateWorldCommand;

export interface CommandState {
  worlds: Record<NodeTaskId, F32Mat4 | undefined>;
  images: Record<NodeTaskId, Image | undefined>;
  geometries: Record<NodeTaskId, Geometry | undefined>;
  userdata: any;
}

export function initCommandState(this: void, userdata: any): CommandState {
  return { images: {}, worlds: {}, geometries: {}, userdata };
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
      (task) => {
        const [ok, err] = xpcall(() => {
          state = task.runCommand({ name: "setup", task }, state);
        }, debug.traceback);

        if (!ok) {
          logger.error("%s", err);
        }
      }
    );
    return state;
  },
  update(state) {
    this.traverse((task) => {
      if (!task.enabled) {
        return false;
      }

      const [ok, err] = xpcall(() => {
        state = task.runCommand({ name: "update", task }, state);
      }, debug.traceback);

      if (!ok) {
        logger.error("%s", err);
      }
    });
    return state;
  },
  updateWorld(state, world) {
    this.traverse((task) => {
      if (!task.enabled) {
        return false;
      }

      const [ok, err] = xpcall(() => {
        state = task.runCommand(
          { name: "update-world", task: task, world },
          state
        );

        task.transform.update();
        const worlds = { ...state.worlds };
        const newWorld = (worlds[task.guid] ??= createF32Mat4());
        mat4.mul(newWorld, world, task.transform.local);
        world = newWorld;
        state = { ...state, worlds };
      }, debug.traceback);

      if (!ok) {
        logger.error("%s", err);
      }
    });

    return state;
  },
  render(state) {
    this.traverse(
      (task) => {
        if (!task.enabled) {
          return false;
        }

        const [ok, err] = xpcall(() => {
          state = task.runCommand({ name: "prerender", task }, state);
        }, debug.traceback);

        if (!ok) {
          logger.error("%s", err);
        }
      },
      (task) => {
        const [ok, err] = xpcall(() => {
          state = task.runCommand({ name: "render", task }, state);
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
  return { ...nodeTaskPrototype, ...params };
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
  transform: Transform;
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
  update(this: NodeTaskType, state: CommandState): RunTaskResult;
  updateWorld(
    this: NodeTaskType,
    state: CommandState,
    world: Mat4
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

export type NodeTaskType = NodeTaskField & NodeTaskPrototype;

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

export function pickOptionalField(
  this: void,
  params?: Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>>
): Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>> {
  if (params == null) {
    return {};
  }

  const { enabled, name, tags, ref } = params;
  return {
    name,
    enabled,
    tags,
    ref,
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
    transform: fields?.transform ?? createTransform(),
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

const nullTaskPrototype: NodeTaskPrototype = {
  run: (_, state) => state,
  ...nodeTaskPrototype,
};

export function createNullTask<
  T extends Partial<Pick<NodeTaskField, NodeTaskTypeOptionalField>>
>(params?: T) {
  return createTask(null, params ?? {}, nullTaskPrototype);
}

export function isNodeTask(this: void, x: unknown): x is NodeTaskType {
  return (x as any)?.isTask === true;
}
