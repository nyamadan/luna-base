import main_module_factory from "./build/main";
import tests_module_factory from "./build/tests";

function runMain() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const Module = {
    canvas,
    arguments: ["/scripts/main/dist/index.lua"],
    preRun: [
      function () {
        const { FS } = Module;
        FS.mkdir("/scripts");
        FS.mkdir("/scripts/main");
        FS.mkdir("/scripts/main/dist");
        FS.createPreloadedFile(
          "/scripts/main/dist",
          "index.lua",
          "/main/dist/index.lua",
          true,
          false
        );

        FS.mkdir("/scripts/luna-base");
        FS.mkdir("/scripts/luna-base/tests");
        FS.mkdir("/scripts/luna-base/tests/assets");
        FS.createPreloadedFile(
          "/scripts/luna-base/tests/assets",
          "waterfall-512x512.png",
          "/luna-base/tests/assets/waterfall-512x512.png",
          true,
          false
        );
      },
    ],
  } as EmscriptenModule & {
    canvas?: HTMLCanvasElement;
    FS: {
      createPreloadedFile: (
        parent: string,
        name: string,
        url: string,
        canRead: boolean,
        canWrite: boolean
      ) => void;
      mkdir: (path: string) => void;
    };
  };

  return (main_module_factory as EmscriptenModuleFactory<typeof Module>)(
    Module
  );
}

function runLuaCoreTests() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const Module = {
    canvas,
    arguments: ["/scripts/luna-base/tests/index.lua"],
    preRun: [
      function () {
        const { FS } = Module;
        FS.mkdir("/scripts");
        FS.mkdir("/scripts/luna-base");
        FS.mkdir("/scripts/luna-base/tests");
        FS.createPreloadedFile(
          "/scripts/luna-base/tests",
          "index.lua",
          "/luna-base/tests/index.lua",
          true,
          false
        );

        FS.mkdir("/assets");
        FS.createPreloadedFile(
          "/assets",
          "waterfall-512x512.png",
          "/luna-base/tests/assets/waterfall-512x512.png",
          true,
          false
        );
        FS.createPreloadedFile(
          "/assets",
          "image.png",
          "/luna-base/tests/assets/image.png",
          true,
          false
        );

        FS.mkdir("/scripts/lib");
        FS.mkdir("/scripts/lib/luaunit");
        FS.createPreloadedFile(
          "/scripts/lib/luaunit",
          "luaunit.lua",
          "/lib/luaunit/luaunit.lua",
          true,
          false
        );
      },
    ],
  } as EmscriptenModule & {
    canvas?: HTMLCanvasElement;
    FS: {
      createPreloadedFile: (
        parent: string,
        name: string,
        url: string,
        canRead: boolean,
        canWrite: boolean
      ) => void;
      mkdir: (path: string) => void;
    };
  };

  return (main_module_factory as EmscriptenModuleFactory<typeof Module>)(
    Module
  );
}

function runTests() {
  const Module = {} as EmscriptenModule;
  return (tests_module_factory as EmscriptenModuleFactory<typeof Module>)(
    Module
  );
}

async function main() {
  try {
    console.log("[[runTests]]");
    await runTests();
  } catch (e) {
    console.error(e);
  }

  try {
    console.log("[[runLuaCoreTests]]");
    await runLuaCoreTests();
  } catch (e) {
    console.error(e);
  }

  try {
    console.log("[[runMain]]");
    await runMain();
  } catch (e) {
    console.error(e);
  }
}

main();
