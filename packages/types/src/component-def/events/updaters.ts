import {
  ComponentContract,
  EventsContract,
} from "../../component-contract/component-contract";
import { ExtractEventNameUnion } from "../../component-contract/component-contract-extractors";
import { ChildrenInstancesDefs } from "../dependencies/children-instances-def";
import { State } from "../values/state";
import { Values } from "../values/values";

export type StateUpdaters<
  TComponentContract extends ComponentContract,
  TState extends State,
> = TComponentContract["events"] extends EventsContract
  ? {
      [EventName in ExtractEventNameUnion<TComponentContract>]?: (
        //TODO use EventInputConsumer
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
          //TODO use EventInputConsumer
          params: Values<TComponentContract> & {
            children: ChildrenInstancesDefs<TComponentContract["children"]>; //mutable
            payload: TComponentContract["events"]["payloads"][EventName];
          },
        ) => void | ChildrenInstancesDefs<TComponentContract["children"]>;
      }
    : never;
