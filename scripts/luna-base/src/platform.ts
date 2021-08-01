import { isApple, isEmscripten, isLinux, isWindows } from "utils";

let osName: "Unknown" | "Windows" | "MacOS" | "Linux" | "Web" = "Unknown";
if (isWindows()) {
  osName = "Windows";
} else if (isEmscripten()) {
  osName = "Web";
} else if (isApple()) {
  osName = "MacOS";
} else if (isLinux()) {
  osName = "Linux";
}

export const OS_NAME = osName;
