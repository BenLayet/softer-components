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

type WithChildListeners<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  readonly listeners?: FromEventContractToEventContract<
    TParentContract,
    TChildContract["events"], //from child
    TParentContract["events"] //to parent
  >[];
};
type WithChildCommands<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = {
  readonly commands?: FromEventContractToChildEventContract<
    TParentContract,
    TParentContract["events"], //from parent
    TChildContract["events"] //to child
  >[];
};

export type ChildConfig<
  TParentContract extends ComponentContract,
  TChildContract extends ComponentContract,
> = WithChildListeners<TParentContract, TChildContract> &
  WithChildCommands<TParentContract, TChildContract>;
