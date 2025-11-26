import {
  ComponentChildrenContract,
  ComponentContract,
  ComponentEventsContract,
  ComponentValuesContract,
} from "@softer-components/types";
import { findComponentDef } from "@softer-components/utils";
import { useDispatch, useStore } from "react-redux";
import { eventToAction, stringToComponentPath } from "./softer-mappers";
import { SofterStore } from "./softer-store";

/////////////////////
// useSofterSelectors
/////////////////////

export const useSofterSelectors = <
  TValueContract extends ComponentValuesContract,
>(
  pathStr: string
): TValueContract => {
  const store = useStore() as SofterStore;
  const componentPath = stringToComponentPath(pathStr);
  const componentDef = findComponentDef(store.rootComponentDef, componentPath);
  const stateManager = store.stateManager;
  const localSelectors = componentDef.selectors ?? {};
  return Object.fromEntries(
    Object.entries(localSelectors).map(
      ([selectorName, localSelector]) =>
        [
          selectorName,
          stateManager.selectValue(componentPath, selectorName, localSelector),
        ] as const
    )
  ) as any;
};

/////////////////////
// useSofterDispatchers
/////////////////////
type EventsContractToUiDispatchers<
  TEventsContract extends ComponentEventsContract,
> = {
  [K in keyof TEventsContract &
    string]: TEventsContract[K]["payload"] extends undefined
    ? () => void
    : (payload: TEventsContract[K]["payload"]) => void;
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

/////////////////////
// useSofterChildrenPath
/////////////////////
type ExtractChildrenPath<TChildrenContract extends ComponentChildrenContract> =
  {
    [K in keyof TChildrenContract]: TChildrenContract[K] extends {
      isCollection: true;
    }
      ? string[]
      : string | null;
  };
export const useSofterChildrenPath = <
  TChildrenContract extends ComponentChildrenContract,
>(
  pathStr: string
): ExtractChildrenPath<TChildrenContract> => {
  const store = useStore() as SofterStore;
  const componentPath = stringToComponentPath(pathStr);
  const stateManager = store.stateManager;
  return stateManager.getChildrenPath(componentPath) as any;
};

/////////////////////
// useSofter
/////////////////////
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
