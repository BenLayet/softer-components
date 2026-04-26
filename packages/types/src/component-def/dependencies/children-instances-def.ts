import {
  ChildInstanceContract,
  ChildrenContract,
} from "../../component-contract/component-contract";

/***************************************************************************************************************
 *                         CHILDREN INSTANCES DEFINITIONS
 ***************************************************************************************************************/
export type ChildInstancesDef<TCollectionContract = ChildInstanceContract> =
  TCollectionContract extends {
    type: "collection";
  }
    ? string[]
    : TCollectionContract extends {
          type: "optional";
        }
      ? boolean | undefined
      : never;
export type ChildrenInstancesDefs<
  TChildren extends ChildrenContract | undefined = undefined,
> = TChildren extends undefined
  ? never
  : MakeUndefinedOrNeverOptional<{
      [ChildName in keyof TChildren]: ChildInstancesDef<TChildren[ChildName]>;
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
