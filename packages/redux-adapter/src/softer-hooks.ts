import {
  ChildInstanceContract,
  ChildrenContract,
  ComponentContract,
  Dispatcher,
  EventsContract,
} from "@softer-components/types";
import { useDispatch, useSelector, useStore } from "react-redux";

import { SofterStore } from "./softer-store";

type ExtractUiDispatchersFromEventContract<T extends EventsContract> = {
  [K in T["uiEvents"][number]]: Dispatcher<T["payloads"], K>;
};
type ExtractUiDispatchers<TComponentContract extends ComponentContract> =
  TComponentContract["events"] extends EventsContract
    ? ExtractUiDispatchersFromEventContract<TComponentContract["events"]>
    : {};

type ExtractChildrenPaths<TComponentContract extends ComponentContract> =
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

export const useSofterSelectors = <
  TComponentContract extends ComponentContract,
>(
  pathStr: string,
): TComponentContract["values"] => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.valuesSelector(pathStr),
  ) as TComponentContract["values"];
};

export const useSofterEvents = <TComponentContract extends ComponentContract>(
  pathStr: string,
): ExtractUiDispatchers<TComponentContract> => {
  const store = useStore() as SofterStore;
  return store.softerViewModel.dispatchers(
    pathStr,
    useDispatch(),
  ) as ExtractUiDispatchers<TComponentContract>;
};

export const useSofterChildrenPaths = <
  TComponentContract extends ComponentContract,
>(
  pathStr: string,
): ExtractChildrenPaths<TComponentContract> => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.childrenPathsSelector(pathStr),
  ) as ExtractChildrenPaths<TComponentContract>;
};

export const useSofter = <TComponentContract extends ComponentContract>(
  pathStr: string,
): [
  TComponentContract["values"],
  ExtractUiDispatchers<TComponentContract>,
  ExtractChildrenPaths<TComponentContract>,
] => [
  useSofterSelectors<TComponentContract>(pathStr),
  useSofterEvents<TComponentContract>(pathStr),
  useSofterChildrenPaths<TComponentContract>(pathStr),
];
