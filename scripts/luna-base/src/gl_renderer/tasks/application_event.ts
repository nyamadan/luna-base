type InputEventType =
  | "KEY_DOWN"
  | "KEY_UP"
  | "MOUSE_BUTTON_DOWN"
  | "MOUSE_BUTTON_UP"
  | "MOUSE_MOVE";

export interface InputEventBase {
  type: InputEventType;
}

export interface KeyInputEvent extends InputEventBase {
  type: "KEY_DOWN" | "KEY_UP";
  code: number;
}

export interface KeyDownInputEvent extends KeyInputEvent {
  type: "KEY_DOWN";
}

export interface KeyUpInputEvent extends KeyInputEvent {
  type: "KEY_UP";
}

export interface MouseButtonInputEvent extends InputEventBase {
  type: "MOUSE_BUTTON_DOWN" | "MOUSE_BUTTON_UP";
  button: number;
}

export interface MouseDownInputEvent extends MouseButtonInputEvent {
  type: "MOUSE_BUTTON_DOWN";
}

export interface MouseUpInputEvent extends MouseButtonInputEvent {
  type: "MOUSE_BUTTON_UP";
}

export interface MouseMoveInputEvent extends InputEventBase {
  type: "MOUSE_MOVE";
  posx: number;
  posy: number;
}

export type InputEvent =
  | KeyDownInputEvent
  | KeyUpInputEvent
  | MouseDownInputEvent
  | MouseMoveInputEvent
  | MouseUpInputEvent;
