import {
  ComponentContract,
  ExtractChildrenPaths,
  ExtractUiDispatchers,
} from "@softer-components/types";
import { useDispatch, useSelector, useStore } from "react-redux";

import { SofterStore } from "./softer-store";

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
