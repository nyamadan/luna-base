import { createNode, NodeType } from "../node";

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
  }> = {}
): NodeType {
  const node = createNode({ name, enabled });
  onCreate?.(node);
  return node;
}
