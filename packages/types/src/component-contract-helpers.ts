import {
  ChildInstanceContract,
  ChildrenContract,
  ComponentContract,
  EventsContract,
} from "./component-contract";
import { Payload } from "./data";

export type ExtractUiEvents<TComponentContract extends ComponentContract> =
  TComponentContract["events"] extends EventsContract
    ? TComponentContract["events"]["uiEvents"]
    : never;

export type ExtractEventNames<TComponentContract extends ComponentContract> =
  TComponentContract["events"] extends EventsContract<
    infer TEventNames,
    any,
    any
  >
    ? TEventNames
    : never;
export type ExtractEventNameUnion<
  TComponentContract extends ComponentContract,
> = ExtractEventNames<TComponentContract>[number];

export type ExtractPayloads<TComponentContract extends ComponentContract> =
  TComponentContract extends never
    ? Record<string, Payload>
    : {
        [TEventName in ExtractEventNames<TComponentContract>[number]]: ExtractPayload<
          TComponentContract,
          TEventName
        >;
      };

export type ExtractPayload<
  TComponentContract extends ComponentContract,
  TEventName extends string,
> = TComponentContract extends never
  ? Payload
  : TComponentContract["events"] extends { payloads: infer TPayloads }
    ? TPayloads extends Record<string, Payload>
      ? TPayloads[TEventName] extends Payload
        ? TPayloads[TEventName]
        : undefined
      : undefined
    : undefined;

export type ExtractChildrenPaths<TComponentContract extends ComponentContract> =
  TComponentContract["children"] extends ChildrenContract
    ? {
        [K in keyof TComponentContract["children"]]: ExtractChildPaths<
          TComponentContract["children"][K]
        >;
      }
    : {};

type ExtractChildPaths<T extends ChildInstanceContract> = T extends {
  type: "collection";
}
  ? string[]
  : T extends {
        type: "optional";
      }
    ? string | undefined
    : string;
