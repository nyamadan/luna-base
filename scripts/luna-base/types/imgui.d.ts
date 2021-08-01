/** @noSelfInFile */
/** @noResolution */
declare module "imgui" {
  export function createContext(): void;
  export function newFrame(): void;
  export function styleColorsDark(): void;
  export function render(): void;
  export function showDemoWindow(p_open: { __native_buffer: never }): void;
  export function implGlfw_InitForOpenGL(install_callbacks: boolean): void;
  export function implOpenGL3_Init(): void;
  export function implGlfw_NewFrame(): void;
  export function implOpenGL3_NewFrame(): void;
  export function implGlfw_Shutdown(): void;
  export function implOpenGL3_Shutdown(): void;
  export function implOpenGL3_RenderDrawData(): void;
}
