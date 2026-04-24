import { ChildrenInstancesDefs } from "./children";
import { ComponentContract, EventsContract } from "./component-contract";
import { ExtractEventNameUnion } from "./component-contract-helpers";
import { State } from "./data";
import { Values } from "./values";

export type StateUpdaters<
  TComponentContract extends ComponentContract,
  TState extends State,
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

export type ChildrenUpdaters<TComponentContract extends ComponentContract> =
  TComponentContract["events"] extends EventsContract
    ? {
        [EventName in ExtractEventNameUnion<TComponentContract>]?: (
          params: Values<TComponentContract> & {
            children: ChildrenInstancesDefs<TComponentContract["children"]>; //mutable
            payload: TComponentContract["events"]["payloads"][EventName];
          },
        ) => void | ChildrenInstancesDefs<TComponentContract["children"]>;
      }
    : never;
