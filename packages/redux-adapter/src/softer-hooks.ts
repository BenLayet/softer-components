import {
  ComponentChildrenContract,
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

type ExtractChildrenPath<TChildrenContract extends ComponentChildrenContract> =
  {
    [K in keyof TChildrenContract]: TChildrenContract[K] extends {
      isCollection: true;
    }
      ? string[]
      : string | null;
  };

export const useSofterSelectors = <
  TValueContract extends ComponentValuesContract,
>(
  pathStr: string,
): TValueContract => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(store.softerUi.valuesSelector(pathStr)) as TValueContract;
};

export const useSofterEvents = <
  TEventsContract extends ComponentEventsContract,
>(
  pathStr: string,
): EventsContractToUiDispatchers<TEventsContract> => {
  const store = useStore() as SofterStore;
  return store.softerUi.dispatchers(
    pathStr,
    useDispatch(),
  ) as EventsContractToUiDispatchers<TEventsContract>;
};

export const useSofterChildrenPath = <
  TChildrenContract extends ComponentChildrenContract,
>(
  pathStr: string,
): ExtractChildrenPath<TChildrenContract> => {
  const store = useStore() as SofterStore;
  // Subscribe to Redux state with useSelector
  return useSelector(
    store.softerUi.childrenPathsSelector(pathStr),
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
