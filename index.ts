import main_module_factory from "./build/main";
import tests_module_factory from "./build/tests";

function runMain() {
  const canvas = document.createElement("canvas");
  canvas.id = "canvas";
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
        FS.mkdir("/scripts/luna-base-test");
        FS.mkdir("/scripts/luna-base-test/assets");
        FS.createPreloadedFile(
          "/scripts/luna-base-test/assets",
          "waterfall-512x512.png",
          "/luna-base-test/assets/waterfall-512x512.png",
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
  canvas.id = "canvas";
  document.body.appendChild(canvas);

  const Module = {
    canvas,
    arguments: ["/scripts/luna-base-test/dist/index.lua"],
    preRun: [
      function () {
        const { FS } = Module;
        FS.mkdir("/scripts");
        FS.mkdir("/scripts/luna-base-test");
        FS.mkdir("/scripts/luna-base-test/dist");
        FS.createPreloadedFile(
          "/scripts/luna-base-test/dist",
          "index.lua",
          "/luna-base-test/dist/index.lua",
          true,
          false
        );

        FS.mkdir("/assets");
        FS.createPreloadedFile(
          "/assets",
          "waterfall-512x512.png",
          "/luna-base-test/assets/waterfall-512x512.png",
          true,
          false
        );
        FS.createPreloadedFile(
          "/assets",
          "image.png",
          "/luna-base-test/assets/image.png",
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

  const el = document.getElementById("canvas");
  if (el != null) {
    el.id = "luna-core-tests";
  }

  try {
    console.log("[[runMain]]");
    await runMain();
  } catch (e) {
    console.error(e);
  }
}

main();
