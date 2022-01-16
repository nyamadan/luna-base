import { isApple, isEmscripten, isLinux, isWindows } from "utils";

let osName: "Linux" | "MacOS" | "Unknown" | "Web" | "Windows" = "Unknown";
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
