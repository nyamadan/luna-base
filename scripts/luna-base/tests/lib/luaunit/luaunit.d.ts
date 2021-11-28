/** @noSelfInFile */

interface Runner {
  startClass: (...args: any[]) => any;
  isMethodTestName: (...args: any[]) => any;
  setupClass: (...args: any[]) => any;
  asFunction: (...args: any[]) => any;
  statusLine: (...args: any[]) => any;
  startSuite: (...args: any[]) => any;
  registerSuite: (...args: any[]) => any;
  internalRunSuiteByNames: (...args: any[]) => any;
  expandClasses: (...args: any[]) => any;
  endTest: (...args: any[]) => any;
  applyPatternFilter: (...args: any[]) => any;
  splitClassMethod: (...args: any[]) => any;
  setupSuite: (...args: any[]) => any;
  parseCmdLine: (...args: any[]) => any;
  unregisterSuite: (...args: any[]) => any;
  runSuiteByInstances: (...args: any[]) => any;
  execOneFunction: (...args: any[]) => any;
  isTestName: (...args: any[]) => any;
  initFromArguments: (...args: any[]) => any;
  teardownSuite: (...args: any[]) => any;
  run: (...args: any[]) => any;
  verbosity: (...args: any[]) => any;
  outputType: (...args: any[]) => any;
  help: (...args: any[]) => any;
  teardownClass: (...args: any[]) => any;
  setOutputType: (t: "text") => void;
  updateStatus: (...args: any[]) => any;
  instances: (...args: any[]) => any;
  endClass: (...args: any[]) => any;
  collectTests: (...args: any[]) => any;
  endSuite: (...args: any[]) => any;
  expandOneClass: (...args: any[]) => any;
  protectedCall: (...args: any[]) => any;
  runSuite: () => number;
  startTest: (...args: any[]) => any;
  version: (...args: any[]) => any;
  internalRunSuiteByInstances: (...args: any[]) => any;
}

export const LuaUnit: {
  new: (this: void) => Runner;
};

export function assertNotInf(this: void, actual: any, expected: any): void;
export function assertIsNumber(this: void, expected: any): void;
export function assertIsBoolean(this: void, actual: any, expected: any): void;
export function assertEquals(this: void, actual: any, expected: any): void;
export function assertStrMatches(this: void, actual: any, expected: any): void;
export function assertPlusZero(this: void, actual: any, expected: any): void;
export function assertErrorMsgMatches(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsBoolean(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNil(this: void, actual: any): void;
export function assertUserdata(this: void, actual: any, expected: any): void;
export function assertNotIsString(this: void, actual: any, expected: any): void;
export function assertIsUserdata(this: void, actual: any, expected: any): void;
export function assertErrorMsgContentEquals(
  this: void,
  actual: any,
  expected: any
): void;
export function success(this: void): void;
export function successIf(this: void, cond: boolean): void;
export function fail(this: void, message: string): void;
export function failIf(this: void, cond: boolean, message: string): void;
export function assertIs(this: void, actual: any, expected: any): void;
export function assertIsPlusInf(this: void, actual: any, expected: any): void;
export function assertNotFunction(this: void, actual: any, expected: any): void;
export function assertAlmostEquals(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsPlusZero(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsCoroutine(
  this: void,
  actual: any,
  expected: any
): void;
export function assertIsNil(this: void, actual: any): void;
export function assertNotBoolean(this: void, actual: any, expected: any): void;
export function assertNotIsNumber(this: void, actual: any, expected: any): void;
export function assertNotAlmostEquals(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsMinusZero(
  this: void,
  actual: any,
  expected: any
): void;
export function assertItemsEquals(this: void, actual: any, expected: any): void;
export function assertIsFalse(this: void, actual: any, expected: any): void;
export function assertNotTrue(this: void, actual: any, expected: any): void;
export function assertTableContains(
  this: void,
  actual: any,
  expected: any
): void;
export function assertError(this: void, actual: any, expected: any): void;
export function assertNotCoroutine(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotStrContains(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsNaN(this: void, actual: any, expected: any): void;
export function assertIsMinusInf(this: void, actual: any, expected: any): void;
export function assertIsString(this: void, actual: any, expected: any): void;
export function assertInf(this: void, actual: any, expected: any): void;
export function assertIsPlusZero(this: void, actual: any, expected: any): void;
export function assertNotThread(this: void, actual: any, expected: any): void;
export function assertNotMinusZero(
  this: void,
  actual: any,
  expected: any
): void;
export function assertEvalToTrue(this: void, actual: any, expected: any): void;
export function assertNotIsFunction(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotPlusZero(this: void, actual: any, expected: any): void;
export function assertNotMinusInf(this: void, actual: any, expected: any): void;
export function assertString(this: void, actual: any, expected: any): void;
export function assertNotStrIContains(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotPlusInf(this: void, actual: any, expected: any): void;
export function assertIsInf(this: void, actual: any, expected: any): void;
export function assertNotNaN(this: void, actual: any, expected: any): void;
export function assertNotIsUserdata(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotFalse(this: void, actual: any, expected: any): void;
export function assertNotString(this: void, actual: any, expected: any): void;
export function assertIsTable(this: void, actual: any, expected: any): void;
export function assertEvalToFalse(this: void, actual: any, expected: any): void;
export function assertNotEquals(this: void, actual: any, expected: any): void;
export function assertFunction(this: void, actual: any, expected: any): void;
export function assertMinusInf(this: void, actual: any, expected: any): void;
export function assertTable(this: void, actual: any, expected: any): void;
export function assertNotIsThread(this: void, actual: any, expected: any): void;
export function assertNotTable(this: void, actual: any, expected: any): void;
export function assertIsCoroutine(this: void, actual: any, expected: any): void;
export function assertNotNumber(this: void, actual: any, expected: any): void;
export function assertNotIsMinusInf(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotUserdata(this: void, actual: any, expected: any): void;
export function assertNotNil(this: void, actual: any): void;
export function assertIsThread(this: void, actual: any, expected: any): void;
export function assertThread(this: void, actual: any, expected: any): void;
export function assertStrContains(this: void, actual: any, expected: any): void;
export function assertMinusZero(this: void, actual: any, expected: any): void;
export function assertPlusInf(this: void, actual: any, expected: any): void;
export function assertNotIs(this: void, actual: any, expected: any): void;
export function assertTrue(this: void, actual: any, expected: any): void;
export function assertErrorMsgContains(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNumber(this: void, actual: any): void;
export function assertCoroutine(this: void, actual: any, expected: any): void;
export function assertFalse(this: void, actual: any, expected: any): void;
export function assertIsFunction(this: void, actual: any, expected: any): void;
export function assertStrIContains(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsTrue(this: void, actual: any, expected: any): void;
export function assertNotIsInf(this: void, actual: any, expected: any): void;
export function assertErrorMsgEquals(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsTable(this: void, actual: any, expected: any): void;
export function assertNotTableContains(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNotIsNil(this: void, actual: any): void;
export function assertNotIsFalse(this: void, actual: any, expected: any): void;
export function assertNotIsPlusInf(
  this: void,
  actual: any,
  expected: any
): void;
export function assertNaN(this: void, actual: any, expected: any): void;
export function assertBoolean(this: void, actual: any, expected: any): void;
export function assertIsTrue(this: void, actual: any, expected: any): void;
export function assertIsMinusZero(this: void, actual: any, expected: any): void;
export function assertIsNaN(this: void, actual: any, expected: any): void;
