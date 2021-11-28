/** @noSelfInFile */

interface Runner {
  setOutputType: (t: "text") => void;
  runSuite: () => number;
}

export const LuaUnit: {
  new: (this: void) => Runner;
};

export function assertNotInf(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertIsNumber(
  this: void,
  actual: unknown
): asserts actual is number;
export function assertIsBoolean(
  this: void,
  actual: unknown
): asserts actual is boolean;
export function assertEquals(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertStrMatches(this: void): void;
export function assertPlusZero(this: void, actual: number): void;
export function assertErrorMsgMatches(this: void): void;
export function assertNotIsBoolean(this: void, actual: unknown): void;
export function assertNil(this: void, actual: unknown): asserts actual is null;
export function assertUserdata(
  this: void,
  actual: unknown
): asserts actual is LuaUserdata;
export function assertNotIsString(this: void, actual: unknown): void;
export function assertIsUserdata(
  this: void,
  actual: unknown
): asserts actual is LuaUserdata;
export function assertErrorMsgContentEquals(this: void): void;
export function success(this: void): void;
export function successIf(this: void, cond: boolean): void;
export function fail(this: void, message: string): void;
export function failIf(this: void, cond: boolean, message: string): void;
export function assertIs(this: void, actual: unknown, expected: unknown): void;
export function assertIsPlusInf(this: void, actual: number): void;
export function assertNotFunction(this: void, actual: unknown): void;
export function assertAlmostEquals(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertNotIsPlusZero(this: void, actual: number): void;
export function assertNotIsCoroutine(this: void, actual: unknown): void;
export function assertIsNil(
  this: void,
  actual: unknown
): asserts actual is null;
export function assertNotBoolean(this: void, actual: unknown): void;
export function assertNotIsNumber(this: void, actual: unknown): void;
export function assertNotAlmostEquals(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertNotIsMinusZero(this: void, actual: unknown): void;
export function assertItemsEquals(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertIsFalse(
  this: void,
  actual: unknown
): asserts actual is false;
export function assertNotTrue(this: void, actual: unknown): void;
export function assertTableContains(this: void): void;
export function assertError(this: void): void;
export function assertNotCoroutine(this: void, actual: unknown): void;
export function assertNotStrContains(this: void, actual: unknown): void;
export function assertNotIsNaN(this: void, actual: unknown): void;
export function assertIsMinusInf(this: void, actual: unknown): void;
export function assertIsString(
  this: void,
  actual: unknown
): asserts actual is string;
export function assertInf(this: void, actual: unknown): void;
export function assertIsPlusZero(
  this: void,
  actual: unknown
): asserts actual is 0;
export function assertNotThread(this: void, actual: unknown): void;
export function assertNotMinusZero(this: void, actual: unknown): void;
export function assertEvalToTrue(this: void): void;
export function assertNotIsFunction(this: void, actual: unknown): void;
export function assertNotPlusZero(this: void, actual: unknown): void;
export function assertNotMinusInf(this: void, actual: unknown): void;
export function assertString(
  this: void,
  actual: unknown
): asserts actual is string;
export function assertNotStrIContains(this: void): void;
export function assertNotPlusInf(this: void, actual: unknown): void;
export function assertIsInf(this: void, actual: unknown): void;
export function assertNotNaN(this: void, actual: unknown): void;
export function assertNotIsUserdata(this: void, actual: unknown): void;
export function assertNotFalse(this: void, actual: unknown): void;
export function assertNotString(this: void, actual: unknown): void;
export function assertIsTable(
  this: void,
  actual: unknown
): asserts actual is LuaTable;
export function assertEvalToFalse(this: void, actual: unknown): void;
export function assertNotEquals(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertFunction(this: void, actual: unknown): void;
export function assertMinusInf(this: void, actual: unknown): void;
export function assertTable(
  this: void,
  actual: unknown
): asserts actual is LuaTable;
export function assertNotIsThread(this: void, actual: unknown): void;
export function assertNotTable(this: void, actual: unknown): void;
export function assertIsCoroutine(this: void, actual: unknown): void;
export function assertNotNumber(this: void, actual: unknown): void;
export function assertNotIsMinusInf(this: void, actual: unknown): void;
export function assertNotUserdata(this: void, actual: unknown): void;
export function assertNotNil(this: void, actual: unknown): void;
export function assertIsThread(
  this: void,
  actual: unknown
): asserts actual is LuaThread;
export function assertThread(
  this: void,
  actual: unknown
): asserts actual is LuaThread;
export function assertStrContains(this: void): void;
export function assertMinusZero(
  this: void,
  actual: unknown
): asserts actual is 0;
export function assertPlusInf(this: void, actual: unknown): void;
export function assertNotIs(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertTrue(this: void, actual: unknown): asserts actual is true;
export function assertErrorMsgContains(this: void): void;
export function assertNumber(
  this: void,
  actual: unknown
): asserts actual is number;
export function assertCoroutine(
  this: void,
  actual: unknown
): asserts actual is LuaThread;
export function assertFalse(
  this: void,
  actual: unknown
): asserts actual is false;
export function assertIsFunction(this: void, actual: unknown): void;
export function assertStrIContains(this: void): void;
export function assertNotIsTrue(this: void, actual: unknown): void;
export function assertNotIsInf(this: void, actual: unknown): void;
export function assertErrorMsgEquals(
  this: void,
  actual: unknown,
  expected: unknown
): void;
export function assertNotIsTable(this: void, actual: unknown): void;
export function assertNotTableContains(this: void, actual: unknown): void;
export function assertNotIsNil<T>(
  this: void,
  actual: T
): asserts actual is NonNullable<T>;
export function assertNotIsFalse(this: void, actual: unknown): void;
export function assertNotIsPlusInf(this: void, actual: unknown): void;
export function assertNaN(this: void, actual: unknown): void;
export function assertBoolean(
  this: void,
  actual: unknown
): asserts actual is boolean;
export function assertIsTrue(
  this: void,
  actual: unknown
): asserts actual is true;
export function assertIsMinusZero(this: void, actual: unknown): void;
export function assertIsNaN(this: void, actual: unknown): void;
