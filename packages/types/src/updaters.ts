import { ChildrenInstancesDefs } from "./children";
import { ComponentContract, EventsContract } from "./component-contract";
import { State } from "./state";
import { Values } from "./values";

export type StateUpdaters<
  TComponentContract extends ComponentContract = any,
  TState extends State = any,
> = TComponentContract["events"] extends EventsContract
  ? {
      [EventName in keyof TComponentContract["events"]]?: (
        params: Values<TComponentContract> & {
          state: TState; //mutable
          payload: TComponentContract["events"][EventName]["payload"];
        },
      ) => void | TState;
    }
  : never;

export type ChildrenUpdaters<
  TComponentContract extends ComponentContract = any,
> = TComponentContract["events"] extends EventsContract
  ? {
      [EventName in keyof TComponentContract["events"]]?: (
        params: Values<TComponentContract> & {
          children: ChildrenInstancesDefs<TComponentContract["children"]>; //mutable
          payload: TComponentContract["events"][EventName]["payload"];
        },
      ) => void | ChildrenInstancesDefs<TComponentContract["children"]>;
    }
  : never;
