import "luna-base";
import { createApplicationTask } from "luna-base/dist/gl_renderer/application_task";
import { createNode } from "luna-base/dist/gl_renderer/node";

import createRotateImageNode from "./rotate_image_node";
import createImguiNode from "./imgui_node";

const root = createNode({
  tasks: [createApplicationTask()],
});
root.start({ worlds: {} });

const rotateImage = createRotateImageNode();
root.addChild(rotateImage);

const imguiNode = createImguiNode();
root.addChild(imguiNode);
