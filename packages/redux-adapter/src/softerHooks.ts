import { useDispatch, useSelector } from "react-redux";
import {
  ComponentDef,
  Event,
  Selector,
  State,
  Value,
} from "@softer-components/types";

/////////////////////
// useSofterDispatchers
/////////////////////
type ExtractDispatchers<TUiEvents extends Event> = {
  [K in TUiEvents["type"]]: (
    payload: Extract<TUiEvents, { type: K }>["payload"],
  ) => void;
};

export const useSofterEvents = <TUiEvents extends Event>(
  path: string,
  componentDef: ComponentDef<any, any, any, any, TUiEvents>,
): ExtractDispatchers<TUiEvents> => {
  const dispatch = useDispatch();
  return componentDef.uiEventTypes?.reduce(
    (res, event) => ({
      ...res,
      [event]: (payload: any) =>
        dispatch({
          type: `${path}${event}`,
          payload,
        }),
    }),
    {},
  ) as any;
};

/////////////////////
// useSofterSelectors
/////////////////////
type ResolvedSelectors<TSelectors extends Record<string, Selector<any>>> = {
  [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
};

export const useSofterSelectors = <
  TSelectors extends Record<string, Selector<any>>,
>(
  path: string,
  componentDef: ComponentDef<any, any, TSelectors>,
): ResolvedSelectors<TSelectors> => {
  const selectors = componentDef.selectors ?? ({} as TSelectors);
  return Object.fromEntries(
    Object.entries(selectors)
      .map(([key, selector]) => [key, toRootSelector(path)(selector)])
      .map(([key, selector]) => [key, useSelector(selector)]),
  );
};
const toRootSelector = (path: string) => (selector: Selector<Value>) =>
  ((rootState: Record<string, State>) =>
    selector(toComponentState(path)(rootState))) as any;

const toComponentState = (path: string) => (rootState: Record<string, State>) =>
  rootState[path];

/////////////////////
// useSofterChildrenPath
/////////////////////
export const useSofterChildrenPath = <TChildren extends Record<string, any>>(
  path: string,
  componentDef: ComponentDef<any, any, any, TChildren, any>,
): Record<keyof TChildren, string> =>
  Object.keys(componentDef.children ?? {}).reduce((res, childName) => {
    res[childName] = `${path}${childName}/`;
    return res;
  }, {}) as any;
/////////////////////
// useSofter
/////////////////////
export const useSofter = <
  TSelectors extends Record<string, Selector<any>>,
  TUiEvents extends Event,
  TChildren extends Record<string, any>,
>(
  path: string,
  componentDef: ComponentDef<any, any, TSelectors, TChildren, TUiEvents>,
): [
  ResolvedSelectors<TSelectors>,
  ExtractDispatchers<TUiEvents>,
  Record<keyof TChildren, string>,
] => {
  return [
    useSofterSelectors(path, componentDef),
    useSofterEvents(path, componentDef),
    useSofterChildrenPath(path, componentDef),
  ];
};
