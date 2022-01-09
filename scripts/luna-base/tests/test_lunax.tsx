import LunaX from "../src/gl_renderer/lunax";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";
import Node from "../src/gl_renderer/components/node_component";
import NodeTask from "../src/gl_renderer/components/task_component";
import {
  initCommandState,
  NodeField,
  NodePrototype,
  NodeRef,
} from "../src/gl_renderer/node";
import { createTask, TaskRef } from "../src/gl_renderer/node_task";

test("Test_LunaX", {
  setUp() {},
  tearDown() {},
  test_node() {
    let called = 0;

    const taskRef: TaskRef = { node: null, task: null };
    const nodeRef: NodeRef = { node: null };
    const root: NodePrototype<null> & NodeField = (
      <Node ref={nodeRef}>
        <NodeTask
          task={createTask(
            null,
            {
              ref: taskRef,
              name: "REF",
            },
            {
              run: (_, state) => state,
            }
          )}
        />
        <NodeTask
          task={createTask(
            null,
            {
              name: "NAME",
              tags: ["TAGS"],
            },
            {
              run(_, state) {
                called++;
                return state;
              },
            }
          )}
        />
      </Node>
    );

    root.updateRefs();
    lu.assertEquals(nodeRef.node, root);
    lu.assertEquals(taskRef.task?.name, "REF");

    root.update(initCommandState(null));
    lu.assertIs(called, 1);
    lu.assertNil(root.findTask((task) => task.name == "NULL"));
    lu.assertNotNil(root.findTask((task) => task.name == "NAME"));
    lu.assertNotNil(root.findTaskInChildren((task) => task.name == "NAME"));
    lu.assertNotNil(root.findTask((task) => task.tags.includes("TAGS")));
  },
});
