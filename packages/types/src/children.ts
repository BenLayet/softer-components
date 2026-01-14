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
> = MakeUndefinedOptional<{
  [ChildName in keyof TChildrenContract]: ChildInstancesDef<
    TChildrenContract[ChildName]
  >;
}>;
type MakeUndefinedOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
    T[K],
    undefined
  >;
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
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
