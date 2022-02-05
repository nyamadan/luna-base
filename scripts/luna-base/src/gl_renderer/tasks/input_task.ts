import { allocTableName, getMetatableName } from "../../tables";
import { safeUnreachable } from "../../unreachable";
import {
  createNodeTaskPrototype,
  createTask,
  NodeTaskField,
  NodeTaskId,
  NodeTaskProps,
  NodeTaskPrototype,
  pickOptionalField,
} from "./node_task";

const TABLE_NAME = allocTableName("LUA_TYPE_INPUT_TASK");

export type InputTaskId = NodeTaskId & { __input_task: never };

export interface InputTaskField
  extends NodeTaskField<InputTaskId, InputTaskType> {}

export interface InputTaskPrototype extends NodeTaskPrototype<InputTaskType> {}

export type InputTaskType = InputTaskField & InputTaskPrototype;

const prototype: InputTaskPrototype = createNodeTaskPrototype({
  run: function (command, state) {
    switch (command.name) {
      case "input": {
        let keys = { ...state.keys };
        let mouse = { ...state.mouse };
        for (const ev of command.inputEvents) {
          switch (ev.type) {
            case "KEY_DOWN": {
              const state = { ...keys.state };
              state[ev.code] = "DOWN";
              keys = { ...keys, state };
              break;
            }
            case "KEY_UP": {
              const state = { ...keys.state };
              state[ev.code] = "UP";
              keys = { ...keys, state };
              break;
            }
            case "MOUSE_BUTTON_DOWN": {
              const state = { ...mouse.state };
              state[ev.button] = "DOWN";
              mouse = { ...mouse, state };
              break;
            }
            case "MOUSE_BUTTON_UP": {
              const state = { ...mouse.state };
              state[ev.button] = "UP";
              mouse = { ...mouse, state };
              break;
            }
            case "MOUSE_MOVE": {
              mouse = { ...mouse, ...{ x: ev.posx, y: ev.posy } };
              break;
            }
            default: {
              safeUnreachable(ev);
            }
          }
        }

        return { ...state, keys, mouse };
      }
      default: {
        return state;
      }
    }
  },
});

export function createInputTask(
  this: void,
  params: NodeTaskProps<InputTaskField, never, never> = {}
): InputTaskType {
  return createTask(
    TABLE_NAME,
    {
      ...pickOptionalField(params),
      ...{},
    },
    prototype
  ) as InputTaskType;
}

export function isInputTask(this: void, x: unknown): x is InputTaskType {
  return getMetatableName(x) === TABLE_NAME;
}

export default function InputTask(
  this: void,
  ...params: Parameters<typeof createInputTask>
) {
  return createInputTask(...params);
}
