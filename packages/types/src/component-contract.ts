import { Payload } from "./data";

export type ValuesContract = { [SelectorName in string]: any };

export type EventsContract<
  TAllEvents extends readonly string[] = readonly string[],
  // Default type of TPayloads has 2 possible values:
  //  - when using EventsContract without parameter: most generic (unspecified
  //  Payload for all events)
  //  - when usingEventsContract with just one parameter: empty object so that
  //  ComponentContract<{events:EventContract<["clicked"]>> does extend
  //  ComponentContract, and the payload of clicked is recognized as undefined
  TPayloads extends { [T in TAllEvents[number]]?: Payload } =
    string[] extends TAllEvents
      ? {
          [T in TAllEvents[number]]?: Payload; // necessary
        }
      : {},
  TUiEvents extends readonly TAllEvents[number][] = TAllEvents,
> = { allEvents: TAllEvents; payloads: TPayloads; uiEvents: TUiEvents };

export type ChildInstanceContract =
  | {}
  | {
      type: "unique" | "optional" | "collection"; // default to "unique"
    };

export type ChildrenContract = Record<
  string,
  ComponentContract & ChildInstanceContract
>;
export type ContextContract = Record<string, ComponentContract>;

/**
 * Contract of a component: defines how the component can be used by the UI and by other components
 */
export type ComponentContract = {
  values?: ValuesContract;
  events?: EventsContract;
  children?: ChildrenContract;
  context?: ContextContract;
};
