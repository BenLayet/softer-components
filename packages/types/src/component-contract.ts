import { Payload } from "./event";

export type ValuesContract = { [SelectorName in string]: any };

export type EventsContract<
  TEventNameUnion extends string = string, // expect union
  TPayloads extends { [T in TEventNameUnion]?: Payload } = {
    [T in TEventNameUnion]?: Payload;
  },
  TUiEvents extends readonly TEventNameUnion[] = readonly TEventNameUnion[],
> = { eventName: TEventNameUnion; payloads: TPayloads; uiEvents: TUiEvents };

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

export type ExtractEventNameUnion<
  TComponentContract extends ComponentContract,
> = TComponentContract extends never
  ? string
  : TComponentContract["events"] extends { eventName: infer TEventNameUnion }
    ? TEventNameUnion extends string
      ? TEventNameUnion
      : never
    : never;

export type ExtractUiEvents<TComponentContract extends ComponentContract> =
  TComponentContract["events"] extends EventsContract
    ? TComponentContract["events"]["uiEvents"]
    : never;
