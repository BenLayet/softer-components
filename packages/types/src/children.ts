import { ChildInstanceContract, ComponentContract } from "./component-contract";
import {
  FromEventContractToChildEventContract,
  FromEventContractToEventContract,
} from "./event-forwarder";

/***************************************************************************************************************
 *                         CHILDREN INSTANCES DEFINITIONS
 ***************************************************************************************************************/
type ChildInstancesDef<TCollectionContract extends ChildInstanceContract> =
  TCollectionContract extends {
    isCollection: true;
  }
    ? string[]
    : TCollectionContract extends {
          isOptional: true;
        }
      ? boolean | undefined
      : never;

export type ChildrenInstancesDefs<
  TChildrenContract extends Record<string, ChildInstanceContract>,
> = MakeUndefinedOrNeverOptional<{
  [ChildName in keyof TChildrenContract]: ChildInstancesDef<
    TChildrenContract[ChildName]
  >;
}>;
type MakeUndefinedOrNeverOptional<T> = {
  // Keys where the property type is `never` are omitted (mapped to `never`),
  // keys that include `undefined` become optional with `undefined` excluded.
  [K in keyof T as T[K] extends never
    ? never
    : undefined extends T[K]
      ? K
      : never]?: Exclude<T[K], undefined>;
} & {
  // Remaining keys (not `never` and not including `undefined`) stay required.
  [K in keyof T as T[K] extends never
    ? never
    : undefined extends T[K]
      ? never
      : K]: T[K];
};

/***************************************************************************************************************
 *                         CHILDREN DEFINITION
 ***************************************************************************************************************/

export type ListenersDef<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = FromEventContractToEventContract<
  TParentContract,
  TChildContract["events"], //from child
  TParentContract["events"] //to parent
>[];

type WithChildListeners<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = {
  readonly listeners?: ListenersDef<TParentContract, TChildContract>;
};

export type CommandsDef<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = FromEventContractToChildEventContract<
  TParentContract,
  TChildContract["isCollection"] extends true ? true : false,
  TParentContract["events"], //from parent
  TChildContract["events"] //to child
>[];

type WithChildCommands<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = {
  readonly commands?: CommandsDef<TParentContract, TChildContract>;
};

export type ChildConfig<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract & ChildInstanceContract,
> = WithChildListeners<TParentContract, TChildContract> &
  WithChildCommands<TParentContract, TChildContract>;
