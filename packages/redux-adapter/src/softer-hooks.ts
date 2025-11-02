import {
  ChildrenDef,
  ComponentDef,
  EventsContract,
  ExtractEventsDef,
  Selector,
  SelectorsFromConstraints,
  State,
  Value,
} from "@softer-components/types";
import { findComponentDef } from "@softer-components/utils";
import { useDispatch, useSelector, useStore } from "react-redux";
import { SofterStore } from "./softer-store";

/////////////////////
// useSofterDispatchers
/////////////////////
type EventsDefToUiDispatchers<TEventsDef extends EventsContract | undefined> =
  TEventsDef extends EventsContract
    ? {
        [K in keyof TEventsDef &
          string]: TEventsDef[K]["payload"] extends undefined
          ? () => void
          : (payload: TEventsDef[K]["payload"]) => void;
      }
    : {};

export const useSofterEvents = <
  TComponentDef extends ComponentDef<any, any, any>,
>(
  path = "/"
): EventsDefToUiDispatchers<ExtractEventsDef<TComponentDef>> => {
  const dispatch = useDispatch();
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(
    store.rootComponentDef,
    path
  ) as TComponentDef;
  const events = componentDef.events ?? {};
  return Object.fromEntries(
    Object.keys(events).map((key) => {
      return [
        key,
        (payload: any) =>
          dispatch({
            type: `${path}${key}`,
            payload: payload,
          }),
      ];
    })
  ) as any;
};
/////////////////////
// useSofterSelectors
/////////////////////
type ResolvedSelectors<
  TSelectors extends SelectorsFromConstraints<any> | undefined,
> =
  TSelectors extends SelectorsFromConstraints<any>
    ? {
        [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
      }
    : {};

export const useSofterSelectors = <
  TComponentDef extends ComponentDef<any, any, any>,
>(
  path = "/"
): ResolvedSelectors<TComponentDef["selectors"]> => {
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(
    store.rootComponentDef,
    path
  ) as TComponentDef;

  const selectors = componentDef.selectors as SelectorsFromConstraints;
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
  (selector: Selector<Value>) =>
  (globalState: Record<string, State>) =>
    selector(globalState[path]);

/////////////////////
// useSofterChildrenPath
/////////////////////
type ExtractChildrenPath<TChildren extends ChildrenDef | undefined> =
  TChildren extends ChildrenDef
    ? {
        [K in keyof TChildren]: TChildren[K] extends {
          isCollection: true;
        }
          ? string[]
          : string;
      }
    : {};
export const useSofterChildrenPath = <
  TComponentDef extends ComponentDef<any, any, any>,
>(
  path = "/"
): ExtractChildrenPath<TComponentDef["children"]> => {
  const componentState = useSelector((state: any) => state[path]);
  const store = useStore() as SofterStore;
  const componentDef = findComponentDef(
    store.rootComponentDef,
    path
  ) as TComponentDef;
  const children = (componentDef.children ?? {}) as Record<string, any>;
  return Object.entries(children).reduce((res, [childName, childDef]) => {
    if (childDef.isCollection) {
      const childCount = childDef.count(componentState);
      const childrenNames = [];
      for (let i = 0; i < childCount; i++) {
        const childKey = childDef.childKey(componentState, i);
        childrenNames.push(`${path}${childName}:${childKey}/`);
      }
      res[childName] = childrenNames;
    } else {
      res[childName] = `${path}${childName}/`;
    }
    return res;
  }, {} as any);
};
/////////////////////
// useSofter
/////////////////////
export const useSofter = <TComponentDef extends ComponentDef<any, any, any>>(
  path: string
): [
  ResolvedSelectors<TComponentDef["selectors"]>,
  EventsDefToUiDispatchers<ExtractEventsDef<TComponentDef>>,
  ExtractChildrenPath<TComponentDef["children"]>,
] => [
  useSofterSelectors<TComponentDef>(path),
  useSofterEvents<TComponentDef>(path),
  useSofterChildrenPath<TComponentDef>(path),
];
