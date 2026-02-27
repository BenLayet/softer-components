import { ChildrenInstancesDefs } from "./children";
import {
  ComponentContract,
  EventsContract,
  ExtractEventNameUnion,
} from "./component-contract";
import { State } from "./state";
import { Values } from "./values";

export type StateUpdaters<
  TComponentContract extends ComponentContract = any,
  TState extends State = any,
> = TComponentContract["events"] extends EventsContract
  ? {
      [EventName in ExtractEventNameUnion<TComponentContract>]?: (
        params: Values<TComponentContract> & {
          state: TState; //mutable
          payload: TComponentContract["events"]["payloads"][EventName];
        },
      ) => void | TState;
    }
  : never;

export type ChildrenUpdaters<
  TComponentContract extends ComponentContract = any,
> = TComponentContract["events"] extends EventsContract
  ? {
      [EventName in ExtractEventNameUnion<TComponentContract>]?: (
        params: Values<TComponentContract> & {
          children: ChildrenInstancesDefs<TComponentContract["children"]>; //mutable
          payload: TComponentContract["events"]["payloads"][EventName];
        },
      ) => void | ChildrenInstancesDefs<TComponentContract["children"]>;
    }
  : never;
