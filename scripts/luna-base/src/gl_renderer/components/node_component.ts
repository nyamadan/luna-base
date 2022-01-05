import { createNode, NodeRef, NodeType } from "../node";

export default function Node(
  this: void,
  {
    name,
    enabled,
    onCreate,
    ref,
  }: Partial<{
    name: string;
    enabled: boolean;
    ref?: NodeRef;
    onCreate: (this: void, o: ReturnType<typeof createNode>) => void;
  }> = {}
): NodeType {
  const node = createNode({ ref: ref ?? null, name, enabled });
  onCreate?.(node);
  return node;
}
