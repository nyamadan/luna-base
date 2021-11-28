export function inspect(
  this: void,
  root: any,
  options?: {
    depth?: number;
    newline?: string;
    indent?: string;
    process?: (
      this: void,
      item: string,
      path: string
    ) => Record<string, string>;
  }
): string;
