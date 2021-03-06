// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LunaX from "luna-base/dist/gl_renderer/lunax";
import NodeTask, {
  createNodeTaskPrototype,
  createTask,
  createTaskRef,
  initCommandState,
  NodeTaskType,
  TaskRef,
} from "luna-base/dist/gl_renderer/tasks/node_task";
import NullTask from "luna-base/dist/gl_renderer/tasks/null_task";
import { isTextTask } from "luna-base/dist/gl_renderer/tasks/text_task";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

test("Test_LunaX", {
  setUp() {},
  tearDown() {},
  test_text() {
    const nodeRef = createTaskRef();
    const root: NodeTaskType = <NullTask ref={nodeRef}>Hello World</NullTask>;

    root.updateRefs();
    root.update(initCommandState(null));
    lu.assertNotNil(root.findTaskInChildren(isTextTask));
  },
  test_node() {
    let called = 0;

    const rootRef: TaskRef = createTaskRef();
    const taskRef: TaskRef = createTaskRef();
    const root: NodeTaskType = (
      <NullTask ref={rootRef}>
        <NodeTask
          task={createTask(
            null,
            {
              ref: taskRef,
              name: "REF",
            },
            createNodeTaskPrototype({
              run: (_, state) => state,
            })
          )}
        />
        <NodeTask
          task={createTask(
            null,
            {
              name: "NAME",
              tags: ["TAGS"],
            },
            createNodeTaskPrototype({
              run(_, state) {
                called++;
                return state;
              },
            })
          )}
        />
      </NullTask>
    );

    root.updateRefs();
    lu.assertNotNil(rootRef.task);
    lu.assertEquals(rootRef.task, root);

    lu.assertNotNil(taskRef.task);
    lu.assertEquals(taskRef.task.name, "REF");

    root.update(initCommandState(null));
    lu.assertIs(called, 1);
    lu.assertNil(root.findTask((task) => task.name == "NULL"));
    lu.assertNotNil(root.findTask((task) => task.name == "NAME"));
    lu.assertNotNil(root.findTaskInChildren((task) => task.name == "NAME"));
    lu.assertNotNil(root.findTask((task) => task.tags.includes("TAGS")));
  },
});
