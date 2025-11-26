import {
  ComponentChildrenContract,
  ComponentContract,
  ComponentEventsContract,
  ComponentValuesContract,
} from "@softer-components/types";
import { findComponentDef } from "@softer-components/utils";
import { shallowEqual, useDispatch, useSelector, useStore } from "react-redux";
import {
  eventToAction,
  getSofterRootTree,
  stringToComponentPath,
} from "./softer-mappers";
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
  pathStr: string
): TValueContract => {
  const store = useStore() as SofterStore;
  const componentPath = stringToComponentPath(pathStr);
  const componentDef = findComponentDef(store.rootComponentDef, componentPath);
  const localSelectors = componentDef.selectors ?? {};

  // Subscribe to Redux state with useSelector
  return useSelector(
    (globalState: any) =>
      Object.fromEntries(
        Object.entries(localSelectors).map(([selectorName, localSelector]) => {
          return [
            selectorName,
            store.stateManager.selectValue(
              getSofterRootTree(globalState),
              componentPath,
              selectorName,
              localSelector
            ),
          ];
        })
      ),
    shallowEqual
  ) as TValueContract;
};

export const useSofterEvents = <
  TEventsContract extends ComponentEventsContract,
>(
  pathStr: string
): EventsContractToUiDispatchers<TEventsContract> => {
  const componentPath = stringToComponentPath(pathStr);
  const dispatch = useDispatch();
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(store.rootComponentDef, componentPath);

  return Object.fromEntries(
    (componentDef.uiEvents ?? []).map((eventName) => {
      return [
        eventName,
        (payload: any) =>
          dispatch(eventToAction({ componentPath, name: eventName, payload })),
      ];
    })
  ) as any;
};

export const useSofterChildrenPath = <
  TChildrenContract extends ComponentChildrenContract,
>(
  pathStr: string
): ExtractChildrenPath<TChildrenContract> => {
  const store = useStore() as SofterStore;
  const componentPath = stringToComponentPath(pathStr);
  const componentDef = findComponentDef(store.rootComponentDef, componentPath);

  // Subscribe to Redux state with useSelector
  return useSelector((globalState: any) =>
    store.stateManager.getChildrenPaths(
      getSofterRootTree(globalState),
      componentPath
    )
  ) as ExtractChildrenPath<TChildrenContract>;
};

export const useSofter = <TComponentContract extends ComponentContract>(
  pathStr: string
): [
  TComponentContract["values"],
  EventsContractToUiDispatchers<TComponentContract["events"]>,
  ExtractChildrenPath<TComponentContract["children"]>,
] => [
  useSofterSelectors<TComponentContract["values"]>(pathStr),
  useSofterEvents<TComponentContract["events"]>(pathStr),
  useSofterChildrenPath<TComponentContract["children"]>(pathStr),
];
