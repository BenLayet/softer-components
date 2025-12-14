import { Values } from "./values";
import { ChildConfig, ChildrenKeys } from "./children";
import { InternalEventForwarders } from "./event-forwarder";
import { ComponentContract } from "./component-contract";
import { Selectors } from "./selectors";

/**
 * Definition of a component
 * @param TComponentContract - Contract of the component.
 */
export type ComponentDef<TComponentContract extends ComponentContract = any> = {
  initialState?: TComponentContract["state"];
  selectors?: Selectors<
    TComponentContract["state"],
    TComponentContract["children"]
  >;
  uiEvents?: (keyof TComponentContract["events"] & string)[];
  updaters?: {
    [EventName in keyof TComponentContract["events"]]?: (
      params: Values<TComponentContract> & {
        state: TComponentContract["state"]; //mutable
        childrenKeys: ChildrenKeys<TComponentContract["children"]>; //mutable
        payload: TComponentContract["events"][EventName]["payload"];
      },
    ) => void | TComponentContract["state"];
  };
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponents?: {
    [ChildName in keyof TComponentContract["children"]]: ComponentDef<
      TComponentContract["children"][ChildName]
    >;
  };
  initialChildrenKeys?: ChildrenKeys<TComponentContract["children"]>;
  childrenConfig?: {
    [ChildName in keyof TComponentContract["children"]]?: ChildConfig<
      TComponentContract,
      TComponentContract["children"][ChildName]
    >;
  };
  effects?: {
    [EventName in keyof TComponentContract["events"]]?: TComponentContract["events"][EventName]["canTrigger"] extends infer DispatchableEventNames extends
      string[]
      ? DispatchableEventNames
      : never;
  };
};
