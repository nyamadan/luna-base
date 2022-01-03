import LunaX from "../lunax";
import { isImageTask } from "../image_task";
import { createTexture, Texture } from "../texture";
import Node from "./node_component";
import NodeTask from "./task_component";
import { createTask, NodeTaskId, NodeTaskType } from "../node_task";
import { logger } from "../../logger";
import { NodeType } from "../node";

function createTextureImageNode(
  this: void,
  {
    enabled,
    onLoad,
  }: Partial<{
    enabled: boolean;
    onLoad: (this: void, fn: Record<NodeTaskId, Texture | undefined>) => void;
  }> = {}
) {
  type ThisType = NodeTaskType & typeof field;

  const field: {
    textures: Record<NodeTaskId, Texture>;
  } & Pick<NodeTaskType, "enabled"> = {
    textures: {},
    enabled: enabled !== false,
  };

  return (
    <Node name="TextureImageNode">
      <NodeTask
        task={createTask(null, field, {
          run(this: ThisType, command, state) {
            const { name, node } = command;
            switch (name) {
              case "setup": {
                let numImageTask = 0;
                let numCompleteImageTask = 0;
                let numTotalCompleteImageTask = 0;
                for (const task of node.tasks) {
                  if (isImageTask(task)) {
                    const images = { ...state.images };
                    const image = images[task.id];
                    if (
                      image?.status === "complete" &&
                      this.textures[task.id] == null
                    ) {
                      logger.debug(`createTexture: ${image}`);
                      const texture = createTexture(image);
                      this.textures[task.id] = texture;
                      numCompleteImageTask++;
                    }

                    if (this.textures[task.id] != null) {
                      numTotalCompleteImageTask++;
                    }
                    numImageTask++;
                  }
                }

                if (
                  numImageTask > 0 &&
                  numCompleteImageTask > 0 &&
                  numTotalCompleteImageTask === numImageTask
                ) {
                  logger.debug(
                    `createTexture:onLoad(total: ${numTotalCompleteImageTask})`
                  );
                  onLoad?.(this.textures);
                }

                return state;
              }
              default: {
                return state;
              }
            }
          },
        })}
      />
    </Node>
  );
}

export default function TextureImageTask(
  this: void,
  {
    enabled,
    onCreate,
    onLoad,
  }: Partial<{
    enabled: boolean;
    onCreate: (this: void, fn: NodeType) => void;
    onLoad: (this: void, fn: Record<NodeTaskId, Texture | undefined>) => void;
  }> = {}
) {
  const o = createTextureImageNode({ onLoad, enabled });
  onCreate?.(o);
  return o;
}
