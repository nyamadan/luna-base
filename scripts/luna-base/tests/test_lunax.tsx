import * as lu from "./lib/luaunit/luaunit";
import LunaX from "../src/gl_renderer/lunax";

import { test } from "./utils";
import Node from "../src/gl_renderer/components/node_component";
import NodeTask from "../src/gl_renderer/components/task_component";
import {
  initCommandState,
  NodeField,
  NodePrototype,
} from "../src/gl_renderer/node";

test("Test_LunaX", {
  setUp() {},
  tearDown() {},
  test_node() {
    let called = 0;
    const root: NodePrototype<null> & NodeField = (
      <Node>
        <NodeTask
          prototype={{
            run(_, state) {
              called++;
              return state;
            },
          }}
        />
      </Node>
    );
    root.update(initCommandState(null));
    lu.assertIs(called, 1);
  },
});
