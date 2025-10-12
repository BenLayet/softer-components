import { useDispatch, useSelector } from "react-redux";
import {
  ComponentDef,
  PayloadRecord,
  Selector,
  State,
  Value,
} from "@softer-components/types";

/////////////////////
// useSofterDispatchers
/////////////////////
type ExtractDispatchers<TPayloadRecord extends PayloadRecord> = {
  [K in keyof TPayloadRecord]: TPayloadRecord[K] extends void
    ? () => {}
    : (payload: TPayloadRecord[K]) => {};
};

export const useSofterEvents = <TPayloadRecord extends PayloadRecord>(
  path: string,
  componentDef: ComponentDef<any, any, TPayloadRecord, any, any>,
): ExtractDispatchers<TPayloadRecord> => {
  const dispatch = useDispatch();
  return componentDef.uiEvents?.reduce(
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
  componentDef: ComponentDef<any, TSelectors, any, any, any>,
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
export const useSofterChildrenPath = <
  TChildrenPaths extends readonly string[] = readonly string[],
>(
  path: string,
  componentDef: ComponentDef<any, any, any, any, TChildrenPaths>,
): Record<TChildrenPaths[number], string> =>
  Object.keys(componentDef.dependencies?.children ?? {}).reduce(
    (res, childName) => {
      res[childName] = `${path}${childName}/`;
      return res;
    },
    {},
  ) as any;
/////////////////////
// useSofter
/////////////////////
export const useSofter = <
  TSelectors extends Record<string, Selector<any>>,
  TPayloadRecord extends PayloadRecord,
  TChildrenPaths extends readonly string[] = readonly string[],
>(
  path: string,
  componentDef: ComponentDef<any, TSelectors, TPayloadRecord, any>,
): [
  ResolvedSelectors<TSelectors>,
  ExtractDispatchers<TPayloadRecord>,
  Record<TChildrenPaths[number], string>,
] => {
  return [
    useSofterSelectors(path, componentDef),
    useSofterEvents(path, componentDef),
    useSofterChildrenPath(path, componentDef),
  ];
};
