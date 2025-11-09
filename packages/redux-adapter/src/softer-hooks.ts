import {
  ChildrenContract,
  EventsContract,
  OptionalValue,
  SelectorsContract,
  State,
  UiContract,
} from "@softer-components/types";
import { findComponentDef } from "@softer-components/utils";
import { useDispatch, useSelector, useStore } from "react-redux";
import { SofterStore } from "./softer-store";

/////////////////////
// useSofterSelectors
/////////////////////

export const useSofterSelectors = <
  TSelectorsContract extends SelectorsContract,
>(
  path = "/"
): TSelectorsContract => {
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(store.rootComponentDef, path);
  const selectors = componentDef.selectors ?? {};
  return Object.fromEntries(
    Object.entries(selectors)
      .map(
        ([key, selector]) =>
          [key, toGlobalStateSelector(path)(selector)] as const
      )
      .map(([key, selector]) => [key, useSelector(selector)])
  ) as any;
};
const toGlobalStateSelector =
  (path: string) =>
  (selector: (state: State) => OptionalValue) =>
  (globalState: Record<string, State>) =>
    selector(globalState[path]);

/////////////////////
// useSofterDispatchers
/////////////////////
type EventsContractToUiDispatchers<TEventsContract extends EventsContract> = {
  [K in keyof TEventsContract &
    string]: TEventsContract[K]["payload"] extends undefined
    ? () => void
    : (payload: TEventsContract[K]["payload"]) => void;
};

export const useSofterEvents = <TEventsContract extends EventsContract>(
  path = "/"
): EventsContractToUiDispatchers<TEventsContract> => {
  const dispatch = useDispatch();
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(store.rootComponentDef, path);
  return Object.fromEntries(
    Object.keys(componentDef.events ?? {}).map((eventName) => {
      return [
        eventName,
        (payload: any) =>
          dispatch({
            type: `${path}${eventName}`,
            payload: payload,
          }),
      ];
    })
  ) as any;
};

/////////////////////
// useSofterChildrenPath
/////////////////////
type ExtractChildrenPath<TChildrenContract extends ChildrenContract> = {
  [K in keyof TChildrenContract]: TChildrenContract[K] extends {
    isCollection: true;
  }
    ? string[]
    : string;
};
export const useSofterChildrenPath = <
  TChildrenContract extends ChildrenContract,
>(
  path = "/"
): ExtractChildrenPath<TChildrenContract> => {
  const componentState = useSelector((state: any) => state[path]);
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(store.rootComponentDef, path);
  const children = (componentDef.children ?? {}) as Record<string, any>;
  return Object.fromEntries(
    Object.entries(children).map(
      ([childName, childNode]) =>
        [
          childName,
          childNode.isCollection
            ? childNode
                .getKeys(componentState)
                .map((key: string) => `${path}${childName}:${key}/`)
            : !childNode.exists || childNode.exists(componentState)
              ? `${path}${childName}/`
              : null,
        ] as const
    )
  ) as any;
};
/////////////////////
// useSofter
/////////////////////
export const useSofter = <TUiContract extends UiContract>(
  path: string
): [
  TUiContract["selectors"],
  EventsContractToUiDispatchers<TUiContract["events"]>,
  ExtractChildrenPath<TUiContract["children"]>,
] => [
  useSofterSelectors<TUiContract["selectors"]>(path),
  useSofterEvents<TUiContract["events"]>(path),
  useSofterChildrenPath<TUiContract["children"]>(path),
];
