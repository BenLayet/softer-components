import { useDispatch, useSelector } from "react-redux";
import {
  WithEvents,
  WithSelectors,
  WithChildrenDef,
  EventsDefToPayloads,
  Payloads,
  Selector,
  Selectors,
  State,
  Value,
  ChildrenDef,
} from "@softer-components/types";

/////////////////////
// useSofterDispatchers
/////////////////////
type PayloadsToUiDispatchers<TPayloads extends Payloads> = {
  [K in keyof TPayloads]: TPayloads[K] extends undefined
  ? () => void
  : (payload: TPayloads[K]) => void;
};

export const useSofterEvents = <TComponentDef extends WithEvents<any, any>>(
  path = "/",
  componentDef: TComponentDef,
): PayloadsToUiDispatchers<EventsDefToPayloads<TComponentDef["events"]>> => {
  const dispatch = useDispatch();
  const events = componentDef.events;
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
    }),
  ) as any;
};
/////////////////////
// useSofterSelectors
/////////////////////
type ResolvedSelectors<TSelectors extends Selectors> = {
  [K in keyof TSelectors]: ReturnType<TSelectors[K]>;
};

export const useSofterSelectors = <TComponentDef extends WithSelectors<any, any>>(
  path = "/",
  componentDef: TComponentDef,
): ResolvedSelectors<TComponentDef["selectors"]> => {
  const selectors = componentDef.selectors as Selectors;
  return Object.fromEntries(
    Object.entries(selectors)
      .map(
        ([key, selector]) =>
          [key, toGlobalStateSelector(path)(selector)] as const,
      )
      .map(([key, selector]) => [key, useSelector(selector)]),
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
type ExtractChildrenPath<TChildren extends ChildrenDef<any>> = {
  [K in keyof TChildren]: TChildren[K] extends {
    isCollection: true;
  }
  ? string[]
  : string;
};
export const useSofterChildrenPath = <TComponentDef extends WithChildrenDef<any>>(
  path = "/",
  componentDef: TComponentDef,
): ExtractChildrenPath<TComponentDef["children"]> => {
  const componentState = useSelector((state: any) => state[path]);
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
export const useSofter = <TComponentDef
  extends WithSelectors<any, any>
  & WithEvents<any, any>
  & WithChildrenDef<any>>(
    path: string,
    componentDef: TComponentDef,
  ): [
    ResolvedSelectors<TComponentDef["selectors"]>,
    PayloadsToUiDispatchers<EventsDefToPayloads<TComponentDef["events"]>>,
    ExtractChildrenPath<TComponentDef["children"]>,
  ] => [
    useSofterSelectors(path, componentDef),
    useSofterEvents(path, componentDef),
    useSofterChildrenPath(path, componentDef),
  ];
