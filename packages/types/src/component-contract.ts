import { Payload } from "./event";
import { State } from "./state";

export type ComponentValuesContract = { [SelectorName in string]: any };
export type ComponentEventsContract<
  EventNames extends string = string,
  DispatchableEventNames extends EventNames = EventNames,
> = {
  [EventName in EventNames]: {
    payload: Payload;
    canTrigger?: DispatchableEventNames[];
  };
};

/**
 * Contract of a component: defines how the component can be used by the UI and by other components
 *
 */
export type ComponentContract<EventNames extends string = string> = {
  state: State;
  values: ComponentValuesContract;
  events: ComponentEventsContract<EventNames>;
  children: Record<string, ComponentContract>;
};
