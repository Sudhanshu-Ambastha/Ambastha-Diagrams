import { parseStateMachine } from "./parseStateMachine.js";
import { layoutStateMachine } from "./layoutStateMachine.js";
import { renderStateMachine } from "./renderStateMachine.js";

export const StateMachine = {
  parse: parseStateMachine,
  layout: layoutStateMachine,
  render: renderStateMachine,
};
