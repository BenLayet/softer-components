import { State } from "@softer-components/types";

import { componentPathToString } from "../component-path";
import { Tree } from "../tree";
import { GlobalEvent } from "../utils.type";
import { diff } from "./diff";

export interface TestListener {
  afterReducer: (event: GlobalEvent, stateAfter: Tree<State>) => void;
}
export class TestLogger implements TestListener {
  private readonly events: GlobalEvent[] = [];
  private readonly states: Tree<State>[] = [];
  afterReducer(event: GlobalEvent, stateAfter: Tree<State>) {
    this.events.push(event);
    this.states.push(JSON.parse(JSON.stringify(stateAfter)));
    const prefix = `EVT#${this.events.length}:`;
    const indentation = prefix.replace(/./g, " ");
    console.log(prefix, `${event.name}`);
    console.log(indentation, `${componentPathToString(event.componentPath)}`);
    console.log(
      indentation,
      diff(
        this.states[this.states.length - 2],
        this.states[this.states.length - 1],
      ),
    );
  }
}
