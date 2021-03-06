export function isNumber(this: void, x: unknown): x is number {
  return type(x) === "number";
}

export function isString(this: void, x: unknown): x is string {
  return type(x) === "string";
}

export function assertIsNumber(
  this: void,
  x: unknown,
  message?: string
): asserts x is number {
  assert(isNumber(x), message);
}

export function assertIsFalsy(this: void, x: unknown, message?: string) {
  assert(!x, message);
}

export function assertIsTruthy(this: void, x: unknown, message?: string) {
  assert(!!x, message);
}

export function assertIsNotNull<T>(
  this: void,
  x: T,
  message?: string
): asserts x is NonNullable<T> {
  assert(x != null, message ?? "value must not be nil");
}

export function assertIsNull(
  this: void,
  x: unknown,
  message?: string
): asserts x is null | undefined {
  assert(x == null, message ?? "value must be nil");
}
