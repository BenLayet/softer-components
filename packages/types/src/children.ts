import { ComponentContract } from "./component-contract";
import {
  FromEventContractToChildEventContract,
  FromEventContractToEventContract,
} from "./event-forwarder";

/***************************************************************************************************************
 *                         CHILDREN KEYS
 ***************************************************************************************************************/
type ChildKeys = string[];
export type ChildrenKeys<
  TChildrenContract extends Record<string, ComponentContract> = Record<
    string,
    ComponentContract
  >,
> = {
  [ChildName in keyof TChildrenContract]: ChildKeys;
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
