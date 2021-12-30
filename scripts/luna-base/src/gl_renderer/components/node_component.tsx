import GLRendererTask from "../gl_renderer_task";
import LunaX from "../lunax";
import Node from "../node";

export function Component() {
  return (
    <Node name="Hello">
      <GLRendererTask />
    </Node>
  );
}
