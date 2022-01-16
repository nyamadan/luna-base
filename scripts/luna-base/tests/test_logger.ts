import { logger } from "../src/logger";
import * as lu from "./lib/luaunit/luaunit";
import { test } from "./utils";

let origPrint: (this: void, ...messages: any[]) => void;
test("Test_Logger", {
  setUp() {
    origPrint = _G["print"];
    _G["print"] = () => null;
    logger.setLevel("DEBUG");
  },
  tearDown() {
    _G["print"] = origPrint;
    logger.setLevel("OFF");
  },
  test_logger() {
    let message: string | null;
    _G["print"] = (x) => (message = x);

    message = null;
    logger.debug("Hello");
    lu.assertEquals(message, "[DEBUG] Hello");

    message = null;
    logger.info("Hello");
    lu.assertEquals(message, "[INFO] Hello");

    message = null;
    logger.error("Hello");
    lu.assertEquals(message, "[ERROR] Hello");

    message = null;
    logger.error("%d, %d, %d", 1, 2, 3);
    lu.assertEquals(message, "[ERROR] 1, 2, 3");
  },
});
