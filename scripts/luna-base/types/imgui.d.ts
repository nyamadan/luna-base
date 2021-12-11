/** @noSelfInFile */
/** @noResolution */
declare module "imgui" {
  export function createContext(): void;
  export function newFrame(): void;
  export function styleColorsDark(): void;
  export function render(): void;
  export function showDemoWindow(p_open?: { __native_buffer: never }): void;
  export function implGlfw_InitForOpenGL(install_callbacks: boolean): void;
  export function implOpenGL3_Init(): void;
  export function implGlfw_NewFrame(): void;
  export function implOpenGL3_NewFrame(): void;
  export function implGlfw_Shutdown(): void;
  export function implOpenGL3_Shutdown(): void;
  export function implOpenGL3_RenderDrawData(): void;
  export function begin(
    name: string,
    p_open?: { __native_buffer: never },
    flags?: number
  ): boolean;
  export function end(): void;
  export function text(text: string): void;
  export function button(text: string, size?: [number, number]): boolean;
  export function sameLine(): void;
  export function radioButton(
    text: string,
    v: { __native_buffer: never },
    v_button: number
  ): boolean;
}
