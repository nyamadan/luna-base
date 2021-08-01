/** @noSelfInFile */

declare interface LURunner {
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

declare interface LU {
  LuaUnit: {
    new: (this: void) => LURunner;
  };
  assertNotInf: (this: void, actual: any, expected: any) => void;
  assertIsNumber: (this: void, expected: any) => void;
  assertIsBoolean: (this: void, actual: any, expected: any) => void;
  assertEquals: (this: void, actual: any, expected: any) => void;
  assertStrMatches: (this: void, actual: any, expected: any) => void;
  assertPlusZero: (this: void, actual: any, expected: any) => void;
  assertErrorMsgMatches: (this: void, actual: any, expected: any) => void;
  assertNotIsBoolean: (this: void, actual: any, expected: any) => void;
  assertNil: (this: void, actual: any) => void;
  assertUserdata: (this: void, actual: any, expected: any) => void;
  assertNotIsString: (this: void, actual: any, expected: any) => void;
  assertIsUserdata: (this: void, actual: any, expected: any) => void;
  assertErrorMsgContentEquals: (
    this: void,
    actual: any,
    expected: any
  ) => void;
  success: (this: void) => void;
  successIf: (this: void, cond: boolean) => void;
  fail: (this: void, message: string) => void;
  failIf: (this: void, cond: boolean, message: string) => void;
  assertIs: (this: void, actual: any, expected: any) => void;
  assertIsPlusInf: (this: void, actual: any, expected: any) => void;
  assertNotFunction: (this: void, actual: any, expected: any) => void;
  assertAlmostEquals: (this: void, actual: any, expected: any) => void;
  assertNotIsPlusZero: (this: void, actual: any, expected: any) => void;
  assertNotIsCoroutine: (this: void, actual: any, expected: any) => void;
  assertIsNil: (this: void, actual: any) => void;
  assertNotBoolean: (this: void, actual: any, expected: any) => void;
  assertNotIsNumber: (this: void, actual: any, expected: any) => void;
  assertNotAlmostEquals: (this: void, actual: any, expected: any) => void;
  assertNotIsMinusZero: (this: void, actual: any, expected: any) => void;
  assertItemsEquals: (this: void, actual: any, expected: any) => void;
  assertIsFalse: (this: void, actual: any, expected: any) => void;
  assertNotTrue: (this: void, actual: any, expected: any) => void;
  assertTableContains: (this: void, actual: any, expected: any) => void;
  assertError: (this: void, actual: any, expected: any) => void;
  assertNotCoroutine: (this: void, actual: any, expected: any) => void;
  assertNotStrContains: (this: void, actual: any, expected: any) => void;
  assertNotIsNaN: (this: void, actual: any, expected: any) => void;
  assertIsMinusInf: (this: void, actual: any, expected: any) => void;
  assertIsString: (this: void, actual: any, expected: any) => void;
  assertInf: (this: void, actual: any, expected: any) => void;
  assertIsPlusZero: (this: void, actual: any, expected: any) => void;
  assertNotThread: (this: void, actual: any, expected: any) => void;
  assertNotMinusZero: (this: void, actual: any, expected: any) => void;
  assertEvalToTrue: (this: void, actual: any, expected: any) => void;
  assertNotIsFunction: (this: void, actual: any, expected: any) => void;
  assertNotPlusZero: (this: void, actual: any, expected: any) => void;
  assertNotMinusInf: (this: void, actual: any, expected: any) => void;
  assertString: (this: void, actual: any, expected: any) => void;
  assertNotStrIContains: (this: void, actual: any, expected: any) => void;
  assertNotPlusInf: (this: void, actual: any, expected: any) => void;
  assertIsInf: (this: void, actual: any, expected: any) => void;
  assertNotNaN: (this: void, actual: any, expected: any) => void;
  assertNotIsUserdata: (this: void, actual: any, expected: any) => void;
  assertNotFalse: (this: void, actual: any, expected: any) => void;
  assertNotString: (this: void, actual: any, expected: any) => void;
  assertIsTable: (this: void, actual: any, expected: any) => void;
  assertEvalToFalse: (this: void, actual: any, expected: any) => void;
  assertNotEquals: (this: void, actual: any, expected: any) => void;
  assertFunction: (this: void, actual: any, expected: any) => void;
  assertMinusInf: (this: void, actual: any, expected: any) => void;
  assertTable: (this: void, actual: any, expected: any) => void;
  assertNotIsThread: (this: void, actual: any, expected: any) => void;
  assertNotTable: (this: void, actual: any, expected: any) => void;
  assertIsCoroutine: (this: void, actual: any, expected: any) => void;
  assertNotNumber: (this: void, actual: any, expected: any) => void;
  assertNotIsMinusInf: (this: void, actual: any, expected: any) => void;
  assertNotUserdata: (this: void, actual: any, expected: any) => void;
  assertNotNil: (this: void, actual: any) => void;
  assertIsThread: (this: void, actual: any, expected: any) => void;
  assertThread: (this: void, actual: any, expected: any) => void;
  assertStrContains: (this: void, actual: any, expected: any) => void;
  assertMinusZero: (this: void, actual: any, expected: any) => void;
  assertPlusInf: (this: void, actual: any, expected: any) => void;
  assertNotIs: (this: void, actual: any, expected: any) => void;
  assertTrue: (this: void, actual: any, expected: any) => void;
  assertErrorMsgContains: (this: void, actual: any, expected: any) => void;
  assertNumber: (this: void, actual: any) => void;
  assertCoroutine: (this: void, actual: any, expected: any) => void;
  assertFalse: (this: void, actual: any, expected: any) => void;
  assertIsFunction: (this: void, actual: any, expected: any) => void;
  assertStrIContains: (this: void, actual: any, expected: any) => void;
  assertNotIsTrue: (this: void, actual: any, expected: any) => void;
  assertNotIsInf: (this: void, actual: any, expected: any) => void;
  assertErrorMsgEquals: (this: void, actual: any, expected: any) => void;
  assertNotIsTable: (this: void, actual: any, expected: any) => void;
  assertNotTableContains: (this: void, actual: any, expected: any) => void;
  assertNotIsNil: (this: void, actual: any) => void;
  assertNotIsFalse: (this: void, actual: any, expected: any) => void;
  assertNotIsPlusInf: (this: void, actual: any, expected: any) => void;
  assertNaN: (this: void, actual: any, expected: any) => void;
  assertBoolean: (this: void, actual: any, expected: any) => void;
  assertIsTrue: (this: void, actual: any, expected: any) => void;
  assertIsMinusZero: (this: void, actual: any, expected: any) => void;
  assertIsNaN: (this: void, actual: any, expected: any) => void;
}
