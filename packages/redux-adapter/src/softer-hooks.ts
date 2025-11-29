import {
  ComponentContract,
  ComponentEventsContract,
  ComponentValuesContract,
} from "@softer-components/types";
import { useDispatch, useSelector, useStore } from "react-redux";
import { SofterStore } from "./softer-store";

type EventsContractToUiDispatchers<
  TEventsContract extends ComponentEventsContract,
> = {
  [K in keyof TEventsContract &
    string]: TEventsContract[K]["payload"] extends undefined
    ? () => void
    : (payload: TEventsContract[K]["payload"]) => void;
};

type ExtractChildrenPath<
  TChildrenContract extends Record<string, ComponentContract>,
> = {
  [K in keyof TChildrenContract]: string[];
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

export const useSofterChildrenPath = <
  TChildrenContract extends Record<string, ComponentContract>,
>(
  pathStr: string,
): ExtractChildrenPath<TChildrenContract> => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerViewModel.childrenPathsSelector(pathStr),
  ) as ExtractChildrenPath<TChildrenContract>;
};

export const useSofter = <TComponentContract extends ComponentContract>(
  pathStr: string,
): [
  TComponentContract["values"],
  EventsContractToUiDispatchers<TComponentContract["events"]>,
  ExtractChildrenPath<TComponentContract["children"]>,
] => [
  useSofterSelectors<TComponentContract["values"]>(pathStr),
  useSofterEvents<TComponentContract["events"]>(pathStr),
  useSofterChildrenPath<TComponentContract["children"]>(pathStr),
];
