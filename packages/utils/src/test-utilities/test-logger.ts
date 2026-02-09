import { GlobalEvent } from "../global-event";
import { StateTree, statePathToString } from "../state-tree";
import { diff } from "./diff";
import { EventProcessorListener } from "./event-processor";

export class TestLogger implements EventProcessorListener {
  private readonly events: GlobalEvent[] = [];
  private readonly states: StateTree[] = [];
  stateUpdated(event: GlobalEvent, stateAfter: StateTree) {
    this.events.push(event);
    this.states.push(JSON.parse(JSON.stringify(stateAfter)));
    const prefix = `EVT#${this.events.length}:`;
    const indentation = prefix.replace(/./g, " ");
    console.log(prefix, `${event.name}`);
    console.log(indentation, `${statePathToString(event.statePath)}`);
    console.log(
      indentation,
      diff(
        this.states[this.states.length - 2],
        this.states[this.states.length - 1],
      ),
    );
  }
}
