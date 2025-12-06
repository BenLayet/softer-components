import {
  ComponentContract,
  ComponentEventsContract,
  ComponentValuesContract,
} from "@softer-components/types";
import { useDispatch, useSelector, useStore } from "react-redux";
import { SofterStore } from "./softer-store";
import { useEffect } from "react";
import { Effects } from "@softer-components/utils";

type EventsContractToUiDispatchers<
  TEventsContract extends ComponentEventsContract,
> = {
  [K in keyof TEventsContract &
    string]: TEventsContract[K]["payload"] extends undefined
    ? () => void
    : (payload: TEventsContract[K]["payload"]) => void;
};

type ExtractChildrenPaths<
  TChildrenContract extends Record<string, ComponentContract>,
> = {
  [K in keyof TChildrenContract]: string[];
};
type ExtractSingleChildrenPaths<
  TChildrenContract extends Record<string, ComponentContract>,
> = {
  [K in keyof TChildrenContract]: string | undefined;
};

export const useSofterSelectors = <
  TValueContract extends ComponentValuesContract,
>(
  pathStr: string,
): TValueContract => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.valuesSelector(pathStr),
  ) as TValueContract;
};

export const useSofterEvents = <
  TEventsContract extends ComponentEventsContract,
>(
  pathStr: string,
): EventsContractToUiDispatchers<TEventsContract> => {
  const store = useStore() as SofterStore;
  return store.softerViewModel.dispatchers(
    pathStr,
    useDispatch(),
  ) as EventsContractToUiDispatchers<TEventsContract>;
};

export const useSofterChildrenPaths = <
  TChildrenContract extends Record<string, ComponentContract>,
>(
  pathStr: string,
): ExtractChildrenPaths<TChildrenContract> => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.childrenPathsSelector(pathStr),
  ) as ExtractChildrenPaths<TChildrenContract>;
};
export const useSofterSingleChildrenPaths = <
  TChildrenContract extends Record<string, ComponentContract>,
>(
  pathStr: string,
): ExtractSingleChildrenPaths<TChildrenContract> => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.pathOfFirstInstanceOfEachChildSelector(pathStr),
  ) as ExtractSingleChildrenPaths<TChildrenContract>;
};

export const useSofter = <TComponentContract extends ComponentContract>(
  pathStr: string,
): [
  TComponentContract["values"],
  EventsContractToUiDispatchers<TComponentContract["events"]>,
  ExtractSingleChildrenPaths<TComponentContract["children"]>,
  ExtractChildrenPaths<TComponentContract["children"]>,
] => [
  useSofterSelectors<TComponentContract["values"]>(pathStr),
  useSofterEvents<TComponentContract["events"]>(pathStr),
  useSofterSingleChildrenPaths<TComponentContract["children"]>(pathStr),
  useSofterChildrenPaths<TComponentContract["children"]>(pathStr),
];

export function useSofterEffects<TComponentContract extends ComponentContract>(
  pathStr: string,
  effects: Effects<TComponentContract>,
) {
  const store = useStore() as SofterStore;
  useEffect(() => store.softerEffectsManager.registerEffects(pathStr, effects));
}
